const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi koneksi MySQL Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_ecommerce_topup',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper untuk verifikasi koneksi saat server start
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ [Database] Berhasil terhubung ke MySQL database:', process.env.DB_NAME || 'db_ecommerce_topup');
    connection.release();
    return true;
  } catch (error) {
    console.warn('⚠️ [Database] Belum terhubung ke MySQL:', error.message);
    console.warn('💡 Catatan untuk Mari: Pastikan MySQL (XAMPP/Laragon/Docker) sudah jalan dan import file database/schema.sql');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
