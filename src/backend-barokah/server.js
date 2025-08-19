const express = require('express');
const cors = require('cors');
const db = require('./src/config/db'); // Impor koneksi database kita

<<<<<<< HEAD
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // <-- Tambahkan ini

// Import routes
const ticketRoutes = require("./src/routes/ticketRoutes"); // <-- Tambahkan ini

dotenv.config();
=======
>>>>>>> a19dc494d94e797ab7ef71d9ef9a97bebaed6723
const app = express();
const port = 5000;

<<<<<<< HEAD
// Middleware
app.use(cors()); // <-- Tambahkan ini agar frontend bisa akses
=======
>>>>>>> a19dc494d94e797ab7ef71d9ef9a97bebaed6723
app.use(express.json());
app.use(cors());

<<<<<<< HEAD
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("🎉 Server backend Barokah Tour berhasil berjalan!");
});

// Gunakan routes
app.use("/api/tickets", ticketRoutes); // <-- Tambahkan ini

app.listen(PORT, () => {
  console.log(`🖥️ Server berjalan di http://localhost:${PORT}`);
=======
// Endpoint untuk login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Buat query SQL untuk mencari user
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

    // Jalankan query ke database
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            // Jika ada error pada database
            console.error("Error pada database:", err);
            return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
        }

        // Periksa hasil query
        if (results.length > 0) {
            // Jika user ditemukan (panjang hasil lebih dari 0)
            console.log(`Login berhasil untuk user: ${username}`);
            res.status(200).json({ success: true, message: 'Login berhasil!' });
        } else {
            // Jika user tidak ditemukan
            console.log(`Login gagal untuk user: ${username}`);
            res.status(401).json({ success: false, message: 'Username atau password salah.' });
        }
    });
});

app.listen(port, () => {
  console.log(`Server backend berjalan di http://localhost:${port}`);
>>>>>>> a19dc494d94e797ab7ef71d9ef9a97bebaed6723
});
