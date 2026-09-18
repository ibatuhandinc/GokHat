'use strict';

const { v4: uuidv4 } = require('uuid');
const { withTransaction } = require('../config/db');
const bookingModel = require('../models/bookingModel');
const flightModel = require('../models/flightModel');
const { BOOKING_STATUS, PNR_LENGTH } = require('../config/constants');

// ─── PNR Kodu Üret ───────────────────────────────────────────────────────────
function generatePnr() {
  // UUID'den 6 karakter al, büyük harf
  return uuidv4().replace(/-/g, '').substring(0, PNR_LENGTH).toUpperCase();
}

// ─── Rezervasyon Oluştur ──────────────────────────────────────────────────────
/**
 * Yeni bir bilet rezervasyonu yapar.
 * Race condition'a karşı transaction + SELECT ... FOR UPDATE kullanılır.
 */
async function createBooking({ userId, flightId, seatNumber, passengerName }) {
  return withTransaction(async (conn) => {
    // 1. Uçuşu kilitle ve müsaitlik kontrolü yap
    const [flightRows] = await conn.query(
      'SELECT id, available_seats, total_seats FROM flights WHERE id = ? FOR UPDATE',
      [flightId]
    );
    const flight = flightRows[0];
    if (!flight) {
      const err = new Error('Uçuş bulunamadı.');
      err.statusCode = 404;
      throw err;
    }
    if (flight.available_seats <= 0) {
      const err = new Error('Bu uçuşta müsait koltuk kalmamıştır.');
      err.statusCode = 409;
      throw err;
    }

    // 2. Koltuk numarası aralık kontrolü
    if (seatNumber < 1 || seatNumber > flight.total_seats) {
      const err = new Error(`Koltuk numarası 1 ile ${flight.total_seats} arasında olmalıdır.`);
      err.statusCode = 400;
      throw err;
    }

    // 3. Koltuğun dolu olup olmadığını kontrol et (UNIQUE kısıtına ek önlem)
    const taken = await bookingModel.isSeatTaken(flightId, seatNumber, conn);
    if (taken) {
      const err = new Error(`${seatNumber} numaralı koltuk zaten alınmış.`);
      err.statusCode = 409;
      throw err;
    }

    // 4. PNR üret (benzersizliği kontrol et)
    let pnrCode;
    let attempts = 0;
    do {
      pnrCode = generatePnr();
      const existing = await bookingModel.findByPnr(pnrCode);
      if (!existing) break;
      attempts++;
    } while (attempts < 5);

    // 5. Rezervasyon kaydı oluştur
    const bookingId = await bookingModel.create(
      {
        user_id: userId,
        flight_id: flightId,
        seat_number: seatNumber,
        passenger_name: passengerName,
        pnr_code: pnrCode,
        status: BOOKING_STATUS.CONFIRMED,
      },
      conn
    );

    // 6. Uçuştaki müsait koltuk sayısını azalt
    const decremented = await flightModel.decrementSeat(flightId, conn);
    if (!decremented) {
      const err = new Error('Koltuk güncelleme sırasında bir hata oluştu.');
      err.statusCode = 500;
      throw err;
    }

    return { bookingId, pnrCode };
  });
}

// ─── Rezervasyon Sorgula ──────────────────────────────────────────────────────
async function getBookingById(bookingId, userId) {
  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    const err = new Error('Rezervasyon bulunamadı.');
    err.statusCode = 404;
    throw err;
  }
  // Kullanıcı kendi rezervasyonuna erişebilir
  if (booking.user_id !== userId) {
    const err = new Error('Bu rezervasyona erişim yetkiniz yok.');
    err.statusCode = 403;
    throw err;
  }
  return booking;
}

// ─── PNR ile Sorgula ──────────────────────────────────────────────────────────
async function getBookingByPnr(pnrCode) {
  const booking = await bookingModel.findByPnr(pnrCode);
  if (!booking) {
    const err = new Error('PNR koduna ait rezervasyon bulunamadı.');
    err.statusCode = 404;
    throw err;
  }
  return booking;
}

// ─── Kullanıcının Rezervasyonları ─────────────────────────────────────────────
async function getUserBookings(userId) {
  return bookingModel.findByUser(userId);
}

// ─── Rezervasyon İptal Et ────────────────────────────────────────────────────
async function cancelBooking(bookingId, userId) {
  return withTransaction(async (conn) => {
    // Rezervasyonu bul ve kilitle
    const [rows] = await conn.query(
      'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId]
    );
    const booking = rows[0];

    if (!booking) {
      const err = new Error('Rezervasyon bulunamadı.');
      err.statusCode = 404;
      throw err;
    }
    if (booking.user_id !== userId) {
      const err = new Error('Bu rezervasyonu iptal etme yetkiniz yok.');
      err.statusCode = 403;
      throw err;
    }
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      const err = new Error('Rezervasyon zaten iptal edilmiş.');
      err.statusCode = 409;
      throw err;
    }

    // Durumu güncelle
    await bookingModel.updateStatus(bookingId, BOOKING_STATUS.CANCELLED, conn);

    // Koltuğu geri ver
    await flightModel.incrementSeat(booking.flight_id, conn);

    return true;
  });
}

module.exports = {
  createBooking,
  getBookingById,
  getBookingByPnr,
  getUserBookings,
  cancelBooking,
};
