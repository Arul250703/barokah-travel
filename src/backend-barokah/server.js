const express = require('express');
const cors = require('cors');
const db = require('./src/config/db'); // Impor koneksi database kita

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

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
});
