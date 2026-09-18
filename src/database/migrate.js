'use strict';

/**
 * migrate.js  –  Veritabanı tablolarını oluşturur.
 *
 * Çalıştır:  npm run migrate
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const schemaPath = path.join(__dirname, 'schema.sql');

async function migrate() {
  console.log('🔄  Migration başlatılıyor...');

  // Önce veritabanı olmadan bağlan (CREATE DATABASE için)
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    multipleStatements: true, // Birden fazla SQL cümlesini çalıştırmak için
  });

  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // SQL dosyasını çalıştır
    await connection.query(schemaSql);

    console.log('✅  Tablolar başarıyla oluşturuldu:');
    console.log('    • users');
    console.log('    • flights');
    console.log('    • bookings');
  } catch (error) {
    console.error('❌  Migration hatası:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }

  console.log('🎉  Migration tamamlandı!');
}

migrate();
