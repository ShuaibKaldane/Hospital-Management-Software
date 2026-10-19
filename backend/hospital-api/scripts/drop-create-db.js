const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    console.log('Connected to MySQL');
    await conn.query('DROP DATABASE IF EXISTS hospital_management_system');
    console.log('Dropped old database');
    await conn.query('CREATE DATABASE hospital_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('Created fresh database');
    await conn.end();
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
