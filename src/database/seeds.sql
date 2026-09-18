-- ============================================================
-- Uçak Rezervasyon Sistemi - Örnek Uçuş Seed Verisi
-- ============================================================
--
-- Bu script, geliştirme ve test ortamı için 4 örnek uçuş ekler.
-- Varolan kayıtları korumak için INSERT IGNORE kullanılır.
--
-- Çalıştırmak için:  npm run seed
-- ============================================================

USE ucak_rezervazyon;

INSERT IGNORE INTO flights
  (flight_number, departure_city, arrival_city, departure_time, arrival_time, price, total_seats, available_seats)
VALUES
  -- Uçuş 1: İstanbul → Ankara (sabah seferi)
  (
    'TK001',
    'Istanbul',
    'Ankara',
    DATE_ADD(NOW(), INTERVAL 1 DAY),
    DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR),
    299.90,
    180,
    180
  ),

  -- Uçuş 2: Ankara → İzmir (öğleden sonra)
  (
    'TK002',
    'Ankara',
    'Izmir',
    DATE_ADD(NOW(), INTERVAL 2 DAY),
    DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 90 MINUTE),
    349.50,
    150,
    148
  ),

  -- Uçuş 3: İstanbul → Antalya (akşam seferi - neredeyse dolu)
  (
    'AJ301',
    'Istanbul',
    'Antalya',
    DATE_ADD(NOW(), INTERVAL 3 DAY),
    DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 75 MINUTE),
    199.00,
    120,
    5
  ),

  -- Uçuş 4: İzmir → İstanbul (ertesi gün dönüş)
  (
    'PC410',
    'Izmir',
    'Istanbul',
    DATE_ADD(NOW(), INTERVAL 4 DAY),
    DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 65 MINUTE),
    279.00,
    160,
    160
  );
