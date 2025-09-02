// file: src/config/db.js

<<<<<<< HEAD:src/backend-barokah/src/config/Buku_Tamu/db.js
// Membuat objek koneksi ke database MySQL Anda
const connection = mysql.createConnection({
  host: 'localhost',          // Alamat server MySQL (biasanya localhost)
  user: 'root',               // Username default untuk XAMPP
  password: '',               // Password default untuk XAMPP adalah kosong
  database: 'barokah_tour' // Nama database yang Anda buat
});

const mysql = require("mysql2"); // Menggunakan library mysql2 versi standar (callback)
const dotenv = require("dotenv");

dotenv.config();
=======
const mysql = require('mysql2');
require('dotenv').config();
>>>>>>> e3a21e2a52f6589559c6e471574147bcd12c5836:src/backend-barokah/src/config/db.js

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Gagal terhubung ke database:", err.message);
        return;
    }
    console.log("✅ Berhasil terhubung ke database MySQL!");
    connection.release();
});

module.exports = pool.promise();