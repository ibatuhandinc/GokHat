'use strict';

const { body, query, param } = require('express-validator');

// ─── Auth Validasyonları ──────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * ad, soyad, e-posta ve güçlü şifre zorunlu.
 */
const registerValidation = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('Ad zorunludur.')
    .isLength({ min: 2, max: 50 }).withMessage('Ad 2-50 karakter arasında olmalıdır.')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]+$/).withMessage('Ad yalnızca harf içerebilir.'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Soyad zorunludur.')
    .isLength({ min: 2, max: 50 }).withMessage('Soyad 2-50 karakter arasında olmalıdır.')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]+$/).withMessage('Soyad yalnızca harf içerebilir.'),

  body('email')
    .trim()
    .notEmpty().withMessage('E-posta zorunludur.')
    .isEmail().withMessage('Geçerli bir e-posta adresi girin.')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('E-posta çok uzun.'),

  body('password')
    .notEmpty().withMessage('Şifre zorunludur.')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.')
    .isLength({ max: 72 }).withMessage('Şifre en fazla 72 karakter olabilir.')
    .matches(/[A-Z]/).withMessage('Şifre en az bir büyük harf içermelidir.')
    .matches(/[0-9]/).withMessage('Şifre en az bir rakam içermelidir.'),
];

/**
 * POST /api/auth/login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('E-posta zorunludur.')
    .isEmail().withMessage('Geçerli bir e-posta adresi girin.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Şifre zorunludur.'),
];

// ─── Uçuş Arama Validasyonları ────────────────────────────────────────────────

/**
 * GET /api/flights  – Query parametre validasyonu
 * from/to (alias) veya departure_city/arrival_city kabul edilir.
 * date YYYY-MM-DD formatında olmalı.
 */
const searchFlightsValidation = [
  query('date')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Tarih YYYY-MM-DD formatında olmalıdır. Örnek: 2026-09-15'),
];

/**
 * GET /api/flights/:id  – Parametre validasyonu
 */
const flightIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Uçuş ID\'si geçerli bir pozitif tam sayı olmalıdır.'),
];

// ─── Rezervasyon Validasyonları ───────────────────────────────────────────────

/**
 * POST /api/bookings  – Yeni rezervasyon
 */
const createBookingValidation = [
  body('flight_id')
    .notEmpty().withMessage('Uçuş ID\'si zorunludur.')
    .isInt({ min: 1 }).withMessage('Geçerli bir uçuş ID\'si girin.'),

  body('seat_number')
    .notEmpty().withMessage('Koltuk numarası zorunludur.')
    .isInt({ min: 1, max: 853 })
    .withMessage('Koltuk numarası 1 ile 853 arasında pozitif bir tam sayı olmalıdır.'),

  body('passenger_name')
    .trim()
    .notEmpty().withMessage('Yolcu adı zorunludur.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Yolcu adı 2-100 karakter arasında olmalıdır.')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]+$/)
    .withMessage('Yolcu adı yalnızca harf ve boşluk içerebilir.'),
];

/**
 * GET /api/bookings/pnr/:pnr  – PNR parametre validasyonu
 */
const pnrValidation = [
  param('pnr')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('PNR kodu 6 karakter olmalıdır.')
    .isAlphanumeric().withMessage('PNR kodu yalnızca harf ve rakam içerebilir.')
    .toUpperCase(),
];

module.exports = {
  registerValidation,
  loginValidation,
  searchFlightsValidation,
  flightIdValidation,
  createBookingValidation,
  pnrValidation,
};
