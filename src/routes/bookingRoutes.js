'use strict';

const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  createBookingValidation,
  pnrValidation,
} = require('../middlewares/validators');

const router = express.Router();

// Tüm rezervasyon endpointleri JWT doğrulama gerektirir
router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/bookings
// Bilet satın al — MySQL Transaction ile koltuk kontrolü + PNR üretimi
// Body: { flight_id, seat_number, passenger_name }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', createBookingValidation, bookingController.createBooking);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/my-tickets   → Kullanıcının tüm biletleri (uçuş detaylarıyla)
// GET /api/bookings/my           → Aynı endpoint, kısa alias
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-tickets', bookingController.myTickets);
router.get('/my', bookingController.myBookings);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/bookings/pnr/:pnr   → PNR kodu ile rezervasyon sorgula
// ─────────────────────────────────────────────────────────────────────────────
router.get('/pnr/:pnr', pnrValidation, bookingController.getBookingByPnr);

// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/bookings/:id         → Rezervasyon detayı (sadece sahibi)
// PATCH /api/bookings/:id/cancel → Rezervasyonu iptal et
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', bookingController.getBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
