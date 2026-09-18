'use strict';

const { pool } = require('../config/db');

// ─── Kullanıcı Sorgular ───────────────────────────────────────────────────────

/**
 * E-posta adresine göre kullanıcı bulur (password_hash dahil).
 * Sadece kimlik doğrulama akışında kullanılır.
 * @param {string} email
 */
async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

/**
 * ID'ye göre kullanıcı bulur — şifre hash'i HARIÇ (güvenli).
 * authMiddleware ve genel profil sorgularında kullanılır.
 * @param {number} id
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, email, first_name, last_name, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * ID'ye göre kullanıcı bulur — password_hash DAHİL.
 * Yalnızca şifre değiştirme akışında kullanılır.
 * @param {number} id
 */
async function findByIdWithHash(id) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Yeni kullanıcı oluşturur.
 * @param {{ email: string, password_hash: string, first_name: string, last_name: string }} data
 * @returns {{ id: number, email: string, first_name: string, last_name: string }}
 */
async function create(data) {
  const { email, password_hash, first_name, last_name } = data;
  const [result] = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name)
     VALUES (?, ?, ?, ?)`,
    [email, password_hash, first_name, last_name]
  );
  return { id: result.insertId, email, first_name, last_name };
}

/**
 * Kullanıcının şifresini günceller.
 * @param {number} id
 * @param {string} newPasswordHash
 */
async function updatePassword(id, newPasswordHash) {
  const [result] = await pool.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [newPasswordHash, id]
  );
  return result.affectedRows > 0;
}

module.exports = { findByEmail, findById, findByIdWithHash, create, updatePassword };
