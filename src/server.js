'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { testConnection } = require('./config/db');
const { errorHandler } = require('./middlewares/errorHandler');

// ─── Route İmportları ─────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// ─── Genel Middleware'ler ─────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Sağlık Kontrolü ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Rotaları ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint bulunamadı.' });
});

// ─── Merkezi Hata Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Sunucuyu Başlat ──────────────────────────────────────────────────────────
async function startServer() {
  await testConnection(); // DB bağlantısını doğrula
  app.listen(PORT, () => {
    console.log(`🚀  Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`📋  API Dokümantasyonu: http://localhost:${PORT}/health`);
    console.log(`🌍  Ortam: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('Sunucu başlatılamadı:', err);
  process.exit(1);
});

module.exports = app; // Test için
