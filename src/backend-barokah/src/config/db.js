const mysql = require('mysql2');

// Membuat objek koneksi ke database MySQL Anda
const connection = mysql.createConnection({
  host: 'localhost',          // Alamat server MySQL (biasanya localhost)
  user: 'root',               // Username default untuk XAMPP
  password: '',               // Password default untuk XAMPP adalah kosong
  database: 'barokah_tour_db' // Nama database yang Anda buat
});

// Mencoba menghubungkan ke database
connection.connect(error => {
  if (error) {
    console.error("Gagal terhubung ke database:", error);
    return;
  }
  console.log("Berhasil terhubung ke database MySQL!");
});

// Ekspor koneksi agar bisa digunakan di file lain
module.exports = connection;
