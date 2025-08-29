<<<<<<< HEAD
// server.js
// Monolithic backend untuk Barokah Tour
// Endpoints disiapkan untuk: DetailPembayaran, VirtualAccountPage, TiketPage, Keuangan (admin), Scanner, dan transaksi

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

dotenv.config();
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(express.json());

// DB pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "barokah_tour",
  connectionLimit: 10,
  timezone: "+07:00",
});

// Health check
app.get("/", (req, res) => {
  res.send("🎉 Server backend Barokah Tour berhasil berjalan!");
});

// ------------------ Helper ------------------
function genRandomSuffix(len = 8) {
  return uuidv4().split("-")[0].slice(0, len).toUpperCase();
}

// ------------------ BOOKINGS ------------------

// POST /api/bookings
app.post("/api/bookings", (req, res) => {
  console.log("📥 POST /api/bookings - Menerima permintaan booking baru...");
  const { package_id, customer_name, customer_email, participants, total_price } = req.body;

  if (!package_id || !customer_name || !customer_email || !participants || !Array.isArray(participants) || participants.length === 0 || total_price === undefined) {
    return res.status(400).json({ success: false, message: "Data booking tidak lengkap." });
  }

  // Ambil city_code dari package
  const getPackageQuery = `
    SELECT p.id AS package_id, p.name AS package_name, c.city_code, c.city_name AS city_name 
    FROM packages p LEFT JOIN cities c ON p.city_id = c.id 
    WHERE p.id = ? LIMIT 1
  `;

  db.query(getPackageQuery, [package_id], (err, pkgRows) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal mengambil data paket." });
    if (!pkgRows || pkgRows.length === 0) return res.status(404).json({ success: false, message: "Paket tidak ditemukan." });

    const pkg = pkgRows[0];
    let prefix = pkg.city_code ? pkg.city_code.toUpperCase() : pkg.city_name ? pkg.city_name.substring(0,3).toUpperCase() : pkg.package_name.substring(0,3).toUpperCase();
    const bookingCode = `${prefix}-${genRandomSuffix(8)}`;

    // Insert booking
    const insertBookingSql = `
      INSERT INTO bookings (package_id, booking_id, customer_name, customer_email, total_price, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'menunggu_pembayaran', NOW(), NOW())
    `;
    db.query(insertBookingSql, [package_id, bookingCode, customer_name, customer_email, total_price], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Gagal menyimpan booking." });

      const newBookingId = result.insertId;

      // Insert peserta ke participants
      const insertParticipantSql = `
        INSERT INTO participants (booking_id, name, phone, address, birth_place, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'valid', NOW())
      `;
      participants.forEach(p => {
        db.query(insertParticipantSql, [newBookingId, p.name, p.phone, p.address, p.birth_place], (err) => {
          if (err) console.error("❌ Error insert participant:", err);
        });
      });

      return res.status(201).json({ success: true, message: "Booking berhasil dibuat!", bookingId: newBookingId, bookingCode, status: "menunggu_pembayaran" });
    });
  });
});

// GET /api/bookings - semua booking (admin)
app.get("/api/bookings", (req, res) => {
  const query = `
    SELECT b.id, b.booking_id AS bookingCode, b.package_id, p.name AS package_name, b.customer_name, b.customer_email, b.total_price, b.status, b.created_at
    FROM bookings b
    LEFT JOIN packages p ON b.package_id = p.id
    ORDER BY b.created_at DESC
  `;
  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal mengambil data booking." });
    res.status(200).json({ success: true, data: rows });
  });
});

// GET /api/bookings/:id - detail booking & peserta
app.get("/api/bookings/:id", (req, res) => {
  const id = req.params.id;

  const bookingQuery = `
    SELECT 
      b.id,
      b.booking_id AS bookingCode,
      b.package_id,
      p.name AS package_name,
      b.customer_name,
      b.customer_email,
      b.total_price,
      b.status,
      b.created_at
    FROM bookings b
    LEFT JOIN packages p ON b.package_id = p.id
    WHERE b.id = ?
    LIMIT 1
  `;

  db.query(bookingQuery, [id], (err, bookingRows) => {
    if (err || bookingRows.length === 0) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Kesalahan server saat mengambil booking.",
        });
    }

    const booking = bookingRows[0];

    const participantsQuery = `
      SELECT id, name, status, scanned_at, created_at, updated_at
      FROM participants
      WHERE booking_id = ?
    `;

    db.query(participantsQuery, [id], (err2, participantsRows) => {
      if (err2) {
        console.error("❌ Error ambil peserta:", err2);
        return res
          .status(500)
          .json({
            success: false,
            message: "Kesalahan server saat mengambil peserta.",
          });
      }

      booking.participants = participantsRows; // simpan peserta sebagai array

      return res.status(200).json({ success: true, data: booking });
    });
  });
});

// GET /api/bookings/:id/ticket - tiket peserta
app.get("/api/bookings/:id/ticket", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM bookings WHERE id = ? LIMIT 1`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "DB error" });
    if (results.length === 0) return res.status(404).json({ success: false, message: "Booking tidak ditemukan." });

    const booking = results[0];
    if (booking.status !== "selesai") return res.status(403).json({ success: false, message: "Pembayaran belum lunas." });

    const participantSql = `SELECT id, name, status FROM participants WHERE booking_id = ?`;
    db.query(participantSql, [booking.id], (err, participants) => {
      if (err) return res.status(500).json({ success: false, message: "DB error saat ambil peserta." });

      res.json({
        success: true,
        ticket: {
          booking_id: booking.booking_id,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          participants,
          total_price: booking.total_price,
          status: booking.status,
          qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.booking_id}`
        }
      });
    });
  });
});

// PUT /api/bookings/:id/status
app.put("/api/bookings/:id/status", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: "Status wajib diisi." });

  const sql = "UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal update status booking." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Booking tidak ditemukan." });

    return res.status(200).json({ success: true, message: "Status booking diperbarui.", dbId: id, status });
  });
});

// DELETE /api/bookings/:id
app.delete("/api/bookings/:id", (req, res) => {
  const id = req.params.id;

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });

    connection.beginTransaction(err => {
      if (err) { connection.release(); return res.status(500).json({ success: false, message: "Kesalahan server." }); }

      const deleteParticipants = "DELETE FROM participants WHERE booking_id = ?";
      connection.query(deleteParticipants, [id], (err) => {
        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ success: false, message: "Gagal hapus peserta." }); });

        const deleteBooking = "DELETE FROM bookings WHERE id = ?";
        connection.query(deleteBooking, [id], (err) => {
          if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ success: false, message: "Gagal hapus booking." }); });

          connection.commit(err => {
            if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ success: false, message: "Kesalahan server." }); });
            connection.release();
            return res.status(200).json({ success: true, message: "Booking berhasil dihapus." });
          });
        });
      });
    });
  });
});

// ------------------ TRANSACTIONS ------------------
app.post("/api/transactions", (req, res) => {
  const { bookingDbId, payment_type, amount_paid, payment_method, va_number } = req.body;
  if (!bookingDbId || !payment_type || amount_paid == null) return res.status(400).json({ success: false, message: "Data transaksi tidak lengkap." });

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });

    connection.beginTransaction(err => {
      if (err) { connection.release(); return res.status(500).json({ success: false, message: "Kesalahan server." }); }

      const insertTransactionSql = `
        INSERT INTO transactions (booking_id, payment_type, amount_paid, payment_method, va_number, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      connection.query(insertTransactionSql, [bookingDbId, payment_type, amount_paid, payment_method || null, va_number || null], (err) => {
        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ success: false, message: "Gagal menyimpan transaksi." }); });

        const newStatus = payment_type === "dp" ? "dp_lunas" : "selesai";
        const updateBookingSql = "UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?";
        connection.query(updateBookingSql, [newStatus, bookingDbId], (err) => {
          if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ success: false, message: "Gagal update status booking." }); });

          connection.commit(err => {
            if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ success: false, message: "Kesalahan server." }); });
            connection.release();
            return res.status(201).json({ success: true, message: "Pembayaran berhasil dicatat!", status: newStatus });
          });
        });
      });
    });
  });
});

// ------------------ SCANNER ------------------
app.post("/api/bookings/scan", (req, res) => {
  const { participantId } = req.body;
  if (!participantId) return res.status(400).json({ success: false, message: "ID Peserta tidak boleh kosong." });

  const findSql = "SELECT * FROM participants WHERE id = ?";
  db.query(findSql, [participantId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });
    if (results.length === 0) return res.status(404).json({ success: false, message: "TIKET TIDAK DITEMUKAN" });

    const participant = results[0];
    if (participant.status === "sudah_digunakan") return res.status(409).json({ success: false, message: "TIKET SUDAH DIGUNAKAN", name: participant.name });
    if (participant.status === "hangus") return res.status(410).json({ success: false, message: "TIKET HANGUS/BATAL", name: participant.name });

    if (participant.status === "valid") {
      const updateSql = "UPDATE participants SET status = 'sudah_digunakan', scanned_at = NOW() WHERE id = ?";
      db.query(updateSql, [participantId], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Gagal update status tiket." });
        return res.status(200).json({ success: true, message: "VALIDASI BERHASIL", name: participant.name });
      });
    } else {
      return res.status(400).json({ success: false, message: "Status tiket tidak valid untuk check-in." });
    }
  });
});

// ------------------ USERS ------------------
// GET /api/users
app.get("/api/users", (req, res) => {
  db.query("SELECT id, username, full_name, email, created_at FROM users", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });
    res.status(200).json({ success: true, data: results });
  });
});

// POST /api/users
app.post("/api/users", (req, res) => {
  const { username, password, full_name, email } = req.body;
  if (!username || !password || !full_name || !email)
    return res
      .status(400)
      .json({ success: false, message: "Semua field wajib diisi." });

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengenkripsi password." });

    const sql =
      "INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, hash, full_name, email], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res
            .status(409)
            .json({
              success: false,
              message: "Username atau Email sudah digunakan.",
            });
        return res
          .status(500)
          .json({ success: false, message: "Gagal menambahkan user." });
      }
      res.status(201).json({ success: true, message: "User berhasil dibuat!" });
    });
  });
});

// POST /api/users/login
app.post("/api/users/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Username dan password wajib diisi." });

  const sql = "SELECT * FROM users WHERE username = ? LIMIT 1";
  db.query(sql, [username], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });
    if (results.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Kesalahan server." });
      if (!isMatch)
        return res
          .status(401)
          .json({ success: false, message: "Password salah." });

      res
        .status(200)
        .json({
          success: true,
          message: "Login berhasil!",
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
          },
        });
    });
  });
});

// ------------------ SERVER LISTEN ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
=======
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
>>>>>>> 0debf6f0044b4c91f398c5242aad5345bde088fc
