// file: src/config/db.js

<<<<<<< HEAD
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config(); // Memuat variabel dari .env

// Buat "pool" koneksi. Pool lebih efisien daripada membuat koneksi baru setiap saat.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
=======
// Membuat objek koneksi ke database MySQL Anda
const connection = mysql.createConnection({
  host: 'localhost',          // Alamat server MySQL (biasanya localhost)
  user: 'root',               // Username default untuk XAMPP
  password: '',               // Password default untuk XAMPP adalah kosong
  database: 'barokah_tour' // Nama database yang Anda buat
>>>>>>> 4da6ef3e30daea19c6ea14071bc713aeeb61b8bb
});

// Uji koneksi
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Berhasil terhubung ke database MySQL!");
    connection.release(); // Lepaskan koneksi setelah selesai
  })
  .catch((err) => {
    console.error("❌ Gagal terhubung ke database:", err.message);
  });

module.exports = pool;
