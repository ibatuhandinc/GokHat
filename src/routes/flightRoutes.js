'use strict';

const express = require('express');
const flightController = require('../controllers/flightController');
const {
  searchFlightsValidation,
  flightIdValidation,
} = require('../middlewares/validators');

const router = express.Router();

// GET /api/flights?from=Istanbul&to=Ankara&date=2026-09-10
// GET /api/flights?departure_city=Istanbul&arrival_city=Ankara&date=2026-09-10
router.get('/', searchFlightsValidation, flightController.listFlights);

// GET /api/flights/:id  – Uçuş detayı + dolu koltuk listesi
router.get('/:id', flightIdValidation, flightController.getFlight);

// GET /api/flights/:id/seats  – Yalnızca müsait koltuk numaraları
router.get('/:id/seats', flightIdValidation, flightController.getAvailableSeats);

module.exports = router;
