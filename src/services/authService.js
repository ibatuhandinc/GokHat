'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// ─── Yardımcı: JWT Üret ───────────────────────────────────────────────────────
/**
 * Kullanıcı ID'sini içeren imzalı JWT token üretir.
 * @param {number} userId
 * @returns {{ token: string, expiresIn: string }}
 */
function generateToken(userId) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign(
    {
      sub: userId,         // subject — standart JWT claim
      iss: 'ucak-api',     // issuer
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
  return { token, expiresIn };
}

// ─── Kayıt (Register) ────────────────────────────────────────────────────────
/**
 * Yeni kullanıcı oluşturur.
 * - E-posta benzersizlik kontrolü
 * - bcrypt ile şifre hashleme (salt rounds: env'den okunur)
 * - Kayıt başarılıysa JWT token döner
 *
 * @param {{ email, password, first_name, last_name }} data
 */
async function register(data) {
  const { email, password, first_name, last_name } = data;

  // E-posta zaten kayıtlı mı?
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error('Bu e-posta adresi zaten kullanımda.');
    err.statusCode = 409;
    throw err;
  }

  // bcrypt ile güvenli hash oluştur
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  const password_hash = await bcrypt.hash(password, saltRounds);

  // Kullanıcıyı kaydet
  const user = await userModel.create({ email, password_hash, first_name, last_name });

  // Token üret ve döndür
  const { token, expiresIn } = generateToken(user.id);
  return {
    user,
    token,
    token_type: 'Bearer',
    expires_in: expiresIn,
  };
}

// ─── Giriş (Login) ───────────────────────────────────────────────────────────
/**
 * Kullanıcı kimlik bilgilerini doğrular ve JWT token döner.
 * Güvenlik notu: kullanıcı bulunamadığında da bcrypt.compare çağrılır
 * (timing attack'a karşı sabit zaman garantisi).
 *
 * @param {string} email
 * @param {string} password
 */
async function login(email, password) {
  const user = await userModel.findByEmail(email);

  // Timing attack'a karşı: kullanıcı yoksa da sahte hash ile compare yap
  const dummyHash = '$2a$12$invaliddummyhashfortimingnnnnn';
  const hashToCompare = user ? user.password_hash : dummyHash;
  const isMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !isMatch) {
    const err = new Error('E-posta veya şifre hatalı.');
    err.statusCode = 401;
    throw err;
  }

  const { token, expiresIn } = generateToken(user.id);

  // password_hash'i yanıttan çıkar
  const { password_hash, ...safeUser } = user;

  return {
    user: safeUser,
    token,
    token_type: 'Bearer',
    expires_in: expiresIn,
  };
}

// ─── Şifre Değiştir (Change Password) ────────────────────────────────────────
/**
 * Kullanıcının mevcut şifresini doğrulayıp yeni şifresini kaydeder.
 *
 * @param {number} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
async function changePassword(userId, currentPassword, newPassword) {
  const user = await userModel.findByIdWithHash(userId);

  if (!user) {
    const err = new Error('Kullanıcı bulunamadı.');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    const err = new Error('Mevcut şifre hatalı.');
    err.statusCode = 401;
    throw err;
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  const newHash = await bcrypt.hash(newPassword, saltRounds);
  await userModel.updatePassword(userId, newHash);

  return true;
}

module.exports = { register, login, changePassword };
