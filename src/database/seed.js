'use strict';

/**
 * seed.js  –  Örnek verileri veritabanına ekler.
 *
 * Çalıştır:  npm run seed
 *
 * Özellikler:
 *  - Varolan kayıtları korur (INSERT IGNORE)
 *  - Migration ile birlikte de çalışır:  npm run migrate:seed
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const seedsPath = path.join(__dirname, 'seeds.sql');

async function seed() {
  console.log('🌱  Seed başlatılıyor...');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ucak_rezervazyon',
    multipleStatements: true,
  });

  try {
    const seedSql = fs.readFileSync(seedsPath, 'utf8');
    await connection.query(seedSql);

    // Eklenen kayıtları göster
    const [flights] = await connection.query(
      'SELECT id, flight_number, departure_city, arrival_city, price, available_seats FROM flights ORDER BY id'
    );

    console.log('✅  Örnek uçuşlar eklendi:\n');
    console.table(flights);
  } catch (error) {
    console.error('❌  Seed hatası:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }

  console.log('🎉  Seed tamamlandı!');
}

seed();
