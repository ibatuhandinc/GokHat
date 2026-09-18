'use strict';

const { validationResult } = require('express-validator');
const bookingService = require('../services/bookingService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/bookings
// Bilet rezervasyonu oluştur — MySQL Transaction ile çalışır
// ─────────────────────────────────────────────────────────────────────────────
async function createBooking(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { flight_id, seat_number, passenger_name } = req.body;

    const result = await bookingService.createBooking({
      userId:        req.user.id,
      flightId:      parseInt(flight_id, 10),
      seatNumber:    parseInt(seat_number, 10),
      passengerName: passenger_name,
    });

    // Oluşturulan rezervasyonun tam detayını getir
    const booking = await bookingService.getBookingById(result.bookingId, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Bilet rezervasyonu başarıyla oluşturuldu.',
      data: {
        booking_id: result.bookingId,
        pnr_code:   result.pnrCode,    // 6 haneli benzersiz PNR
        ...booking,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/:id
// Belirli bir rezervasyonun detayını döner (sadece sahibi erişebilir)
// ─────────────────────────────────────────────────────────────────────────────
async function getBooking(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(
      parseInt(req.params.id, 10),
      req.user.id
    );
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/pnr/:pnr
// PNR kodu ile rezervasyon sorgula (büyük/küçük harf duyarsız)
// ─────────────────────────────────────────────────────────────────────────────
async function getBookingByPnr(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const pnr = req.params.pnr.toUpperCase();
    const booking = await bookingService.getBookingByPnr(pnr);
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/my          (kısa alias)
// GET /api/bookings/my-tickets  (açıklayıcı alias)
//
// Giriş yapmış kullanıcının tüm biletlerini uçuş detaylarıyla listeler.
// ─────────────────────────────────────────────────────────────────────────────
async function myBookings(req, res, next) {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    return res.status(200).json({
      success: true,
      count:   bookings.length,
      data:    bookings,
    });
  } catch (error) {
    next(error);
  }
}

// myTickets, myBookings ile aynı controller fonksiyonunu kullanır
const myTickets = myBookings;

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/bookings/:id/cancel
// Rezervasyonu iptal et — koltuğu geri ver (Transaction)
// ─────────────────────────────────────────────────────────────────────────────
async function cancelBooking(req, res, next) {
  try {
    await bookingService.cancelBooking(parseInt(req.params.id, 10), req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Rezervasyon başarıyla iptal edildi. Koltuk tekrar satışa açıldı.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getBooking,
  getBookingByPnr,
  myBookings,
  myTickets,
  cancelBooking,
};
