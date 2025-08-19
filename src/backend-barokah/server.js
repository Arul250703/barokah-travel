// file: server.js

const express = require("express");
const dotenv = require("dotenv");

// Memuat variabel environment dari .env
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();

// Middleware untuk membaca JSON dari body request
app.use(express.json());

// Ambil PORT dari .env, atau gunakan 3000 jika tidak ada
const PORT = process.env.PORT || 3000;

// Route sederhana untuk pengetesan
app.get("/", (req, res) => {
  res.send("🎉 Server backend berhasil berjalan!");
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`🖥️ Server berjalan di http://localhost:${PORT}`);
});
