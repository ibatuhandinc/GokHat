'use strict';

const flightModel = require('../models/flightModel');

// ─── Uçuş Listele ─────────────────────────────────────────────────────────────
/**
 * Filtrelere göre uçuş listeler.
 * API'den gelen from/to query parametreleri doğrudan modele iletilir;
 * model içinde departure_city/arrival_city alias'larıyla eşleştirilir.
 *
 * @param {{ from?: string, to?: string,
 *           departure_city?: string, arrival_city?: string,
 *           date?: string }} filters
 */
async function listFlights(filters) {
  return flightModel.findAll(filters);
}

// ─── Tek Uçuş Getir ──────────────────────────────────────────────────────────
async function getFlightById(id) {
  const flight = await flightModel.findById(id);
  if (!flight) {
    const err = new Error('Uçuş bulunamadı.');
    err.statusCode = 404;
    throw err;
  }
  return flight;
}

// ─── Uçuş Detayı + Dolu Koltuklar ───────────────────────────────────────────
/**
 * Uçuş bilgisini ve o uçuşa ait dolu koltuk listesini birlikte döner.
 * GET /api/flights/:id için kullanılır.
 *
 * @param {number} id
 * @returns {{ flight: object, takenSeats: number[], availableSeats: number }}
 */
async function getFlightDetails(id) {
  const { flight, takenSeats } = await flightModel.findByIdWithTakenSeats(id);
  if (!flight) {
    const err = new Error('Uçuş bulunamadı.');
    err.statusCode = 404;
    throw err;
  }
  return {
    flight,
    takenSeats,           // Dolu koltuk numaraları
    takenSeatCount: takenSeats.length,
    availableSeats: flight.available_seats,
  };
}

// ─── Müsait Koltuklar ────────────────────────────────────────────────────────
async function getAvailableSeats(flightId) {
  const seats = await flightModel.getAvailableSeats(flightId);
  if (seats === null) {
    const err = new Error('Uçuş bulunamadı.');
    err.statusCode = 404;
    throw err;
  }
  return seats;
}

module.exports = { listFlights, getFlightById, getFlightDetails, getAvailableSeats };
