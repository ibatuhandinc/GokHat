'use strict';

/**
 * Merkezi hata yönetimi middleware'i.
 * Express'teki tüm next(error) çağrıları buraya yönlendirilir.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // MySQL duplicate entry hatası (UNIQUE kısıtı ihlali)
  if (err.code === 'ER_DUP_ENTRY') {
    const message = err.message.includes('seat_number')
      ? 'Bu koltuk zaten başka bir yolcu tarafından alınmış.'
      : 'Bu kayıt zaten mevcut.';
    return res.status(409).json({ success: false, message });
  }

  // MySQL bağlantı hataları
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('❌ Veritabanı bağlantı hatası:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Veritabanı bağlantısı kurulamadı.',
    });
  }

  // Uygulama tarafından fırlatılan hataların statusCode'u varsa kullan
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu hatası.';

  // Production ortamında stack trace gösterme
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };

  console.error(`[${req.method}] ${req.originalUrl} → ${statusCode}:`, message);
  return res.status(statusCode).json(response);
}

module.exports = { errorHandler };
