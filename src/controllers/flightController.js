'use strict';

const { validationResult } = require('express-validator');
const flightService = require('../services/flightService');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/flights
// Query parametreleri:
//   from            → kalkış şehri (alias: departure_city)
//   to              → varış şehri  (alias: arrival_city)
//   departure_city  → kalkış şehri (uzun form)
//   arrival_city    → varış şehri  (uzun form)
//   date            → YYYY-MM-DD  (o güne ait uçuşlar)
// ─────────────────────────────────────────────────────────────────────────────
async function listFlights(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // from/to (kısa) ve departure_city/arrival_city (uzun) her ikisini de al
    const { from, to, departure_city, arrival_city, date } = req.query;

    const flights = await flightService.listFlights({
      from,
      to,
      departure_city,
      arrival_city,
      date,
    });

    return res.status(200).json({
      success: true,
      count: flights.length,
      filters: {
        from: from || departure_city || null,
        to:   to   || arrival_city   || null,
        date: date || null,
      },
      data: flights,
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/flights/:id
// Uçuş detayı + o uçuşta rezerve edilmiş dolu koltuk listesi
// ─────────────────────────────────────────────────────────────────────────────
async function getFlight(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    const { flight, takenSeats, takenSeatCount, availableSeats } =
      await flightService.getFlightDetails(id);

    return res.status(200).json({
      success: true,
      data: {
        ...flight,
        // Dolu koltuk özeti — bilet alma ekranında koltuk haritası için kullanılır
        taken_seats:       takenSeats,       // [3, 7, 14, ...]
        taken_seat_count:  takenSeatCount,
        available_seats:   availableSeats,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/flights/:id/seats
// Sadece müsait koltuk numaralarını listeler
// ─────────────────────────────────────────────────────────────────────────────
async function getAvailableSeats(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const seats = await flightService.getAvailableSeats(id);

    return res.status(200).json({
      success: true,
      flight_id: id,
      available_seat_count: seats.length,
      seats,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { listFlights, getFlight, getAvailableSeats };
