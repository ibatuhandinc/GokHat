'use strict';

const { pool } = require('../config/db');

// ─── Uçuş Sorguları ───────────────────────────────────────────────────────────

/**
 * Tüm uygun uçuşları listeler (isteğe bağlı filtrelerle).
 *
 * Parametre adları her iki konvansiyonu da kabul eder:
 *   - departure_city / arrival_city   (dahili)
 *   - from / to                       (API query alias)
 *
 * @param {{ departure_city?: string, arrival_city?: string,
 *           from?: string, to?: string, date?: string }} filters
 */
async function findAll(filters = {}) {
  // Alias desteği: from → departure_city, to → arrival_city
  const departure = filters.departure_city || filters.from || null;
  const arrival   = filters.arrival_city   || filters.to   || null;
  const date      = filters.date || null;

  let sql = `
    SELECT
      id, flight_number,
      departure_city, arrival_city,
      departure_time, arrival_time,
      price, total_seats, available_seats
    FROM flights
    WHERE 1 = 1
  `;
  const params = [];

  if (departure) {
    sql += ' AND LOWER(departure_city) = LOWER(?)';
    params.push(departure);
  }
  if (arrival) {
    sql += ' AND LOWER(arrival_city) = LOWER(?)';
    params.push(arrival);
  }
  if (date) {
    sql += ' AND DATE(departure_time) = ?';
    params.push(date);
  }

  sql += ' ORDER BY departure_time ASC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * ID'ye göre tek uçuş getirir (müsait olmayan uçuşlar dahil).
 * @param {number} id
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT
       id, flight_number,
       departure_city, arrival_city,
       departure_time, arrival_time,
       price, total_seats, available_seats
     FROM flights
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Uçuş detayını VE o uçuşa ait dolu koltuk listesini birlikte getirir.
 * Tek sorguda değil iki ayrı hafif sorguda yapılır — JOIN yerine
 * ayrı sorgular okunabilirliği artırır ve indeks kullanımını optimize eder.
 *
 * @param {number} id
 * @returns {{ flight: object|null, takenSeats: number[] }}
 */
async function findByIdWithTakenSeats(id) {
  // 1. Uçuş bilgisi
  const [flightRows] = await pool.query(
    `SELECT
       id, flight_number,
       departure_city, arrival_city,
       departure_time, arrival_time,
       price, total_seats, available_seats
     FROM flights
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  const flight = flightRows[0] || null;
  if (!flight) return { flight: null, takenSeats: [] };

  // 2. Dolu koltuklar (iptal edilmişler hariç)
  const [takenRows] = await pool.query(
    `SELECT seat_number
     FROM bookings
     WHERE flight_id = ?
       AND status != 'cancelled'
     ORDER BY seat_number ASC`,
    [id]
  );
  const takenSeats = takenRows.map((r) => r.seat_number);

  return { flight, takenSeats };
}

/**
 * Belirli bir uçuşun müsait koltuk numaralarını listeler.
 * @param {number} flightId
 * @returns {number[]|null}
 */
async function getAvailableSeats(flightId) {
  const [flightRows] = await pool.query(
    'SELECT total_seats FROM flights WHERE id = ? LIMIT 1',
    [flightId]
  );
  if (!flightRows[0]) return null;

  const totalSeats = flightRows[0].total_seats;

  const [takenRows] = await pool.query(
    `SELECT seat_number FROM bookings
     WHERE flight_id = ? AND status != 'cancelled'`,
    [flightId]
  );
  const takenSeats = new Set(takenRows.map((r) => r.seat_number));

  const available = [];
  for (let i = 1; i <= totalSeats; i++) {
    if (!takenSeats.has(i)) available.push(i);
  }
  return available;
}

/**
 * Mevcut koltuk sayısını 1 azaltır (transaction içinde kullanılır).
 * @param {number} flightId
 * @param {import('mysql2/promise').PoolConnection} conn
 */
async function decrementSeat(flightId, conn) {
  const [result] = await conn.query(
    `UPDATE flights
     SET available_seats = available_seats - 1
     WHERE id = ? AND available_seats > 0`,
    [flightId]
  );
  return result.affectedRows > 0;
}

/**
 * Mevcut koltuk sayısını 1 artırır (rezervasyon iptalinde).
 * @param {number} flightId
 * @param {import('mysql2/promise').PoolConnection} conn
 */
async function incrementSeat(flightId, conn) {
  await conn.query(
    `UPDATE flights
     SET available_seats = available_seats + 1
     WHERE id = ? AND available_seats < total_seats`,
    [flightId]
  );
}

module.exports = {
  findAll,
  findById,
  findByIdWithTakenSeats,
  getAvailableSeats,
  decrementSeat,
  incrementSeat,
};
