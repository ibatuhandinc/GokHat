'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const {
  registerValidation,
  loginValidation,
} = require('../middlewares/validators');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register  — Yeni kullanıcı kaydı
// Body: { first_name, last_name, email, password }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', registerValidation, authController.register);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login  — Kullanıcı girişi → JWT token
// Body: { email, password }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', loginValidation, authController.login);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  — Mevcut kullanıcı profili (korumalı)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', authenticate, authController.me);

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/auth/change-password  — Şifre değiştirme (korumalı)
// Body: { current_password, new_password }
// ─────────────────────────────────────────────────────────────────────────────
const changePasswordValidation = [
  body('current_password')
    .notEmpty().withMessage('Mevcut şifre zorunludur.'),
  body('new_password')
    .notEmpty().withMessage('Yeni şifre zorunludur.')
    .isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır.')
    .matches(/[A-Z]/).withMessage('Yeni şifre en az bir büyük harf içermelidir.')
    .matches(/[0-9]/).withMessage('Yeni şifre en az bir rakam içermelidir.'),
];

router.patch(
  '/change-password',
  authenticate,
  changePasswordValidation,
  authController.changePassword
);

module.exports = router;
