// file: src/config/db.js

const mysql = require("mysql2"); // Menggunakan library mysql2 versi standar (callback)
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "barokah_tour",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- PERBAIKAN DI SINI ---
// Uji koneksi dengan gaya callback, bukan .then()
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Gagal terhubung ke database:", err.message);
    // Keluar dari aplikasi jika koneksi database gagal saat start
    process.exit(1);
  }

  if (connection) {
    console.log("✅ Berhasil terhubung ke database MySQL!");
    // Lepaskan koneksi kembali ke pool setelah selesai
    connection.release();
  }
});

module.exports = pool;
