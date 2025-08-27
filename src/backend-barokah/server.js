// file: server.js (di folder utama)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Memuat dan menggunakan file rute
const packageRoutes = require('./src/routes/packageRoutes');
// const postRoutes = require('./src/routes/postRoutes'); // (jika Anda sudah membuatnya)
// const pageRoutes = require('./src/routes/pageRoutes');   // (jika Anda sudah membuatnya)

app.use('/api', packageRoutes); // Semua rute di packageRoutes akan diawali dengan /api
// app.use('/api', postRoutes);
// app.use('/api', pageRoutes);

// Jalankan Server
app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
});