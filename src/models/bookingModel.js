'use strict';

const { pool } = require('../config/db');

// ─── Rezervasyon Sorguları ────────────────────────────────────────────────────

/**
 * Yeni rezervasyon oluşturur (transaction bağlantısı üzerinden).
 * @param {{ user_id, flight_id, seat_number, passenger_name, pnr_code, status }} data
 * @param {import('mysql2/promise').PoolConnection} conn
 */
async function create(data, conn) {
  const { user_id, flight_id, seat_number, passenger_name, pnr_code, status } = data;
  const [result] = await conn.query(
    `INSERT INTO bookings (user_id, flight_id, seat_number, passenger_name, pnr_code, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, flight_id, seat_number, passenger_name, pnr_code, status || 'confirmed']
  );
  return result.insertId;
}

/**
 * ID'ye göre rezervasyon getirir.
 * @param {number} id
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT b.id, b.user_id, b.flight_id, b.seat_number,
            b.passenger_name, b.pnr_code, b.status, b.created_at,
            f.flight_number, f.departure_city, f.arrival_city,
            f.departure_time, f.arrival_time, f.price
     FROM bookings b
     JOIN flights f ON f.id = b.flight_id
     WHERE b.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * PNR koduna göre rezervasyon getirir.
 * @param {string} pnrCode
 */
async function findByPnr(pnrCode) {
  const [rows] = await pool.query(
    `SELECT b.*, f.flight_number, f.departure_city, f.arrival_city,
            f.departure_time, f.arrival_time, f.price
     FROM bookings b
     JOIN flights f ON f.id = b.flight_id
     WHERE b.pnr_code = ? LIMIT 1`,
    [pnrCode.toUpperCase()]
  );
  return rows[0] || null;
}

/**
 * Kullanıcıya ait tüm rezervasyonları getirir.
 * @param {number} userId
 */
async function findByUser(userId) {
  const [rows] = await pool.query(
    `SELECT b.id, b.seat_number, b.passenger_name, b.pnr_code,
            b.status, b.created_at,
            f.flight_number, f.departure_city, f.arrival_city,
            f.departure_time, f.arrival_time, f.price
     FROM bookings b
     JOIN flights f ON f.id = b.flight_id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Belirli bir uçuşta koltuk numarasının dolu olup olmadığını kontrol eder.
 * (UNIQUE kısıtı zaten veritabanında var; bu metod ön kontrol içindir.)
 * @param {number} flightId
 * @param {number} seatNumber
 * @param {import('mysql2/promise').PoolConnection} [conn]
 */
async function isSeatTaken(flightId, seatNumber, conn) {
  const db = conn || pool;
  const [rows] = await db.query(
    `SELECT 1 FROM bookings
     WHERE flight_id = ? AND seat_number = ? AND status != 'cancelled'
     LIMIT 1`,
    [flightId, seatNumber]
  );
  return rows.length > 0;
}

/**
 * Rezervasyon durumunu günceller.
 * @param {number} bookingId
 * @param {string} status
 * @param {import('mysql2/promise').PoolConnection} [conn]
 */
async function updateStatus(bookingId, status, conn) {
  const db = conn || pool;
  const [result] = await db.query(
    'UPDATE bookings SET status = ? WHERE id = ?',
    [status, bookingId]
  );
  return result.affectedRows > 0;
}

module.exports = { create, findById, findByPnr, findByUser, isSeatTaken, updateStatus };
