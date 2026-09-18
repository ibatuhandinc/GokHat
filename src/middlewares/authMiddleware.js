'use strict';

const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcı: Authorization başlığından token'ı çıkar
// ─────────────────────────────────────────────────────────────────────────────
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// authenticate  –  Zorunlu kimlik doğrulama middleware'i
//
// Authorization: Bearer <token> başlığını kontrol eder.
// Geçersiz/eksik token → 401 döner ve isteği durdurur.
// Geçerli token → req.user içine kullanıcı bilgilerini yazar.
// ─────────────────────────────────────────────────────────────────────────────
async function authenticate(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Yetkilendirme token\'ı eksik veya geçersiz formatta. ' +
               'Lütfen "Authorization: Bearer <token>" başlığını ekleyin.',
    });
  }

  try {
    // Token'ı doğrula; süresi dolmuş veya imza hatalıysa hata fırlatır
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token içindeki kullanıcı ID'siyle veritabanını kontrol et
    // (silinmiş/devre dışı hesaplara karşı koruma)
    const user = await userModel.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token geçerli ancak hesap bulunamadı. Lütfen tekrar giriş yapın.',
      });
    }

    // req.user → { id, email, first_name, last_name, created_at }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş. Lütfen tekrar giriş yapın.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token. Lütfen tekrar giriş yapın.',
      });
    }
    // Beklenmedik hata → genel 401
    return res.status(401).json({ success: false, message: 'Kimlik doğrulama başarısız.' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// optionalAuthenticate  –  İsteğe bağlı kimlik doğrulama middleware'i
//
// Token varsa doğrular ve req.user yazar.
// Token yoksa veya geçersizse isteği DURDURMAZ; req.user = null olarak devam eder.
// Herkese açık ama giriş yapanlara ek içerik sunan endpointler için kullanılır.
// ─────────────────────────────────────────────────────────────────────────────
async function optionalAuthenticate(req, res, next) {
  const token = extractToken(req);
  req.user = null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.sub);
    if (user) req.user = user;
  } catch (_err) {
    // Geçersiz token → sessizce geç
  }

  next();
}

module.exports = { authenticate, optionalAuthenticate };
