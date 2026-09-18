'use strict';

const { validationResult } = require('express-validator');
const authService = require('../services/authService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Yeni kullanıcı kaydı — e-posta benzersiz, şifre bcrypt ile hashlenir
// ─────────────────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: 'Kayıt başarıyla tamamlandı. Hoş geldiniz!',
      data: {
        user:       result.user,
        token:      result.token,
        token_type: result.token_type,   // "Bearer"
        expires_in: result.expires_in,   // "7d"
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Kullanıcı girişi — e-posta + şifre doğrular, JWT token döner
// ─────────────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Giriş başarılı. İyi uçuşlar!',
      data: {
        user:       result.user,
        token:      result.token,
        token_type: result.token_type,   // "Bearer"
        expires_in: result.expires_in,   // "7d"
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Giriş yapmış kullanıcının profil bilgilerini döner
// authMiddleware tarafından req.user doldurulur
// ─────────────────────────────────────────────────────────────────────────────
async function me(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      id:         req.user.id,
      email:      req.user.email,
      first_name: req.user.first_name,
      last_name:  req.user.last_name,
      full_name:  `${req.user.first_name} ${req.user.last_name}`,
      created_at: req.user.created_at,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/auth/change-password
// Mevcut şifreyi doğrulayıp yeni şifre kaydeder
// Body: { current_password, new_password }
// ─────────────────────────────────────────────────────────────────────────────
async function changePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { current_password, new_password } = req.body;
    await authService.changePassword(req.user.id, current_password, new_password);

    return res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi. Lütfen tekrar giriş yapın.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me, changePassword };
