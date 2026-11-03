const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi SSL otomatis untuk Cloud Database (TiDB / Aiven / Remote MySQL)
const isCloudHost = process.env.DB_HOST && 
  process.env.DB_HOST !== 'localhost' && 
  process.env.DB_HOST !== '127.0.0.1';

const sslConfig = (process.env.DB_SSL === 'true' || isCloudHost)
  ? { minVersion: 'TLSv1.2', rejectUnauthorized: process.env.DB_SSL_REJECT !== 'false' }
  : false;

// Konfigurasi koneksi MySQL Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_ecommerce_topup',
  port: Number(process.env.DB_PORT) || 3306,
  ssl: sslConfig,
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
    console.warn('💡 Catatan untuk Mari: Pastikan kredensial MySQL di .env / Environment Variables sudah tepat.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
