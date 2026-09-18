-- ============================================================
-- Uçak Rezervasyon Sistemi - Veritabanı Şeması
-- Versiyon: 1.0.0
-- ============================================================

-- Veritabanını oluştur (yoksa)
CREATE DATABASE IF NOT EXISTS ucak_rezervazyon
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ucak_rezervazyon;

-- ─── 1. USERS TABLOSU ──────────────────────────────────────────────────────────
--
-- Kayıtlı kullanıcıları tutar.
-- password_hash: bcrypt ile hashlenmiş şifre
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  first_name    VARCHAR(100)     NOT NULL,
  last_name     VARCHAR(100)     NOT NULL,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 2. FLIGHTS TABLOSU ────────────────────────────────────────────────────────
--
-- Uçuş seferlerini tutar.
-- available_seats: gerçek zamanlı müsait koltuk sayısı (rezervasyon işlemlerinde güncellenir)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flights (
  id               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  flight_number    VARCHAR(20)      NOT NULL,
  departure_city   VARCHAR(100)     NOT NULL,
  arrival_city     VARCHAR(100)     NOT NULL,
  departure_time   DATETIME         NOT NULL,
  arrival_time     DATETIME         NOT NULL,
  price            DECIMAL(10, 2)   NOT NULL,
  total_seats      SMALLINT UNSIGNED NOT NULL DEFAULT 180,
  available_seats  SMALLINT UNSIGNED NOT NULL DEFAULT 180,

  PRIMARY KEY (id),
  UNIQUE KEY uq_flights_number (flight_number),
  INDEX idx_flights_departure_city (departure_city),
  INDEX idx_flights_arrival_city   (arrival_city),
  INDEX idx_flights_departure_time (departure_time),

  -- Müsait koltuk sayısı toplam koltuk sayısını aşamasın
  CONSTRAINT chk_available_seats CHECK (available_seats <= total_seats),
  -- Kalkış süresi varış süresinden önce olmalı
  CONSTRAINT chk_flight_times CHECK (departure_time < arrival_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─── 3. BOOKINGS TABLOSU ───────────────────────────────────────────────────────
--
-- Bilet rezervasyonlarını tutar.
-- pnr_code: Passenger Name Record - uçuş check-in kodu (6 karakter büyük harf)
-- status: 'confirmed' | 'cancelled' | 'pending'
--
-- KRİTİK KISIT: UNIQUE(flight_id, seat_number)
--   Aynı uçuşta aynı koltuğun iki kez satılmasını veritabanı seviyesinde önler.
--   Bu kısıt, uygulama katmanındaki kontrollere ek olarak son savunma hattıdır.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED      NOT NULL,
  flight_id       INT UNSIGNED      NOT NULL,
  seat_number     SMALLINT UNSIGNED NOT NULL,
  passenger_name  VARCHAR(200)      NOT NULL,
  pnr_code        CHAR(6)           NOT NULL,
  status          ENUM('confirmed', 'cancelled', 'pending')
                                    NOT NULL DEFAULT 'confirmed',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- PNR kodu eşsiz olmalı
  UNIQUE KEY uq_bookings_pnr (pnr_code),

  -- TEMEL KISIT: Aynı uçuşta aynı koltuk tekrar rezerve edilemesin
  -- NOT: İptal edilmiş rezervasyonlarda aynı koltuk yeniden satılabilsin diye
  --      bu UNIQUE kısıtı sadece active (non-cancelled) kayıtlar için
  --      uygulama katmanında ek olarak kontrol edilir.
  --      Veritabanı seviyesindeki kesin engel burada sağlanır:
  UNIQUE KEY uq_bookings_flight_seat (flight_id, seat_number),

  -- Foreign key ilişkileri
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id)   REFERENCES users   (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_flight
    FOREIGN KEY (flight_id) REFERENCES flights (id) ON DELETE CASCADE,

  -- Sorgulama performansı için indeksler
  INDEX idx_bookings_user_id   (user_id),
  INDEX idx_bookings_flight_id (flight_id),
  INDEX idx_bookings_status    (status),
  INDEX idx_bookings_created   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
