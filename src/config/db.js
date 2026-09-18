'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

// ─── Bağlantı Havuzu Konfigürasyonu ───────────────────────────────────────────
const poolConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'ucak_rezervazyon',

  // Bağlantı Havuzu Ayarları
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 10000,

  // Güvenilirlik Ayarları
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // Karakter seti
  charset: 'utf8mb4',

  // Tarih/zaman değerleri JavaScript Date olarak dönsün
  dateStrings: false,

  // Tip dönüşümleri
  typeCast: true,
};

// ─── Pool Oluştur ─────────────────────────────────────────────────────────────
const pool = mysql.createPool(poolConfig);

// ─── Bağlantıyı Test Et ───────────────────────────────────────────────────────
/**
 * Veritabanı bağlantısını test eder.
 * Uygulama başlarken bir kez çağrılır.
 */
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 AS ok');
    if (rows[0].ok === 1) {
      console.log(
        `✅  MySQL bağlantısı başarılı → ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`
      );
    }
  } catch (error) {
    console.error('❌  MySQL bağlantı hatası:', error.message);
    process.exit(1); // Kritik hata → uygulamayı durdur
  } finally {
    if (connection) connection.release();
  }
}

// ─── Yardımcı: Transaction Çalıştır ──────────────────────────────────────────
/**
 * Verilen callback'i bir transaction içinde çalıştırır.
 * Hata olursa otomatik ROLLBACK yapar.
 *
 * @param {(connection: import('mysql2/promise').PoolConnection) => Promise<T>} callback
 * @returns {Promise<T>}
 */
async function withTransaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection, withTransaction };
