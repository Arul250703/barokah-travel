// server.js
// Monolithic backend untuk Barokah Tour
// Endpoints disiapkan untuk: DetailPembayaran, VirtualAccountPage, TiketPage, Keuangan (admin), Scanner, dan transaksi

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

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


// Definisikan __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buat folder uploads jika belum ada
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
// Baru dipakai di sini
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Konfigurasi upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


// ------------------ Helper ------------------
function genRandomSuffix(len = 8) {
  return uuidv4().split("-")[0].slice(0, len).toUpperCase();
}


// ------------------ BOOKINGS ------------------

// POST /api/bookings
app.post("/api/bookings", (req, res) => {
  console.log("📥 POST /api/bookings - Menerima permintaan booking baru...");
  const {
    package_id,
    customer_name,
    customer_email,
    participants,
    total_price,
  } = req.body;

  if (
    !package_id ||
    !customer_name ||
    !customer_email ||
    !participants ||
    !Array.isArray(participants) ||
    participants.length === 0 ||
    total_price === undefined
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Data booking tidak lengkap." });
  }

  // Ambil city_code dari package
  const getPackageQuery = `
    SELECT p.id AS package_id, p.name AS package_name, c.city_code, c.city_name AS city_name 
    FROM packages p LEFT JOIN cities c ON p.city_id = c.id 
    WHERE p.id = ? LIMIT 1
  `;

  db.query(getPackageQuery, [package_id], (err, pkgRows) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengambil data paket." });
    if (!pkgRows || pkgRows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Paket tidak ditemukan." });

    const pkg = pkgRows[0];
    let prefix = pkg.city_code
      ? pkg.city_code.toUpperCase()
      : pkg.city_name
      ? pkg.city_name.substring(0, 3).toUpperCase()
      : pkg.package_name.substring(0, 3).toUpperCase();
    const bookingCode = `${prefix}-${genRandomSuffix(8)}`;

    // Insert booking
    const insertBookingSql = `
      INSERT INTO bookings (package_id, booking_id, customer_name, customer_email, total_price, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'menunggu_pembayaran', NOW(), NOW())
    `;
    db.query(
      insertBookingSql,
      [package_id, bookingCode, customer_name, customer_email, total_price],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Gagal menyimpan booking." });

        const newBookingId = result.insertId;

        // Insert peserta ke participants
        const insertParticipantSql = `
        INSERT INTO participants (booking_id, name, phone, address, birth_place, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'valid', NOW())
      `;
        participants.forEach((p) => {
          db.query(
            insertParticipantSql,
            [newBookingId, p.name, p.phone, p.address, p.birth_place],
            (err) => {
              if (err) console.error("❌ Error insert participant:", err);
            }
          );
        });

        return res
          .status(201)
          .json({
            success: true,
            message: "Booking berhasil dibuat!",
            bookingId: newBookingId,
            bookingCode,
            status: "menunggu_pembayaran",
          });
      }
    );
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
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengambil data booking." });
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
      return res.status(500).json({
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
        return res.status(500).json({
          success: false,
          message: "Kesalahan server saat mengambil peserta.",
        });
      }

      booking.participants = participantsRows; // simpan peserta sebagai array

      return res.status(200).json({ success: true, data: booking });
    });
  });
});

// POST /api/packages
app.post("/api/packages", (req, res) => {
  const { 
    name, 
    city_id, 
    trip_code, 
    description, 
    price, 
    imageUrl, 
    duration, 
    max_participants, 
    is_active 
  } = req.body;

  const sql = `
    INSERT INTO packages 
    (name, city_id, trip_code, description, price, imageUrl, duration, max_participants, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  db.query(
    sql, 
    [name, city_id, trip_code, description, price, imageUrl, duration, max_participants, is_active || 1],
    (err, result) => {
      if (err) {
        console.error("Error creating package:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ 
        message: "Package created successfully",
        id: result.insertId 
      });
    }
  );
});

// GET /api/bookings/:id/ticket - tiket peserta
app.get("/api/bookings/:id/ticket", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM bookings WHERE id = ? LIMIT 1`;
  db.query(sql, [id], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: "DB error" });
    if (results.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Booking tidak ditemukan." });

    const booking = results[0];
    if (booking.status !== "selesai")
      return res
        .status(403)
        .json({ success: false, message: "Pembayaran belum lunas." });

    const participantSql = `SELECT id, name, status FROM participants WHERE booking_id = ?`;
    db.query(participantSql, [booking.id], (err, participants) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "DB error saat ambil peserta." });

      res.json({
        success: true,
        ticket: {
          booking_id: booking.booking_id,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          participants,
          total_price: booking.total_price,
          status: booking.status,
          qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.booking_id}`,
        },
      });
    });
  });
});

// PUT /api/bookings/:id/status
app.put("/api/bookings/:id/status", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status)
    return res
      .status(400)
      .json({ success: false, message: "Status wajib diisi." });

  const sql = "UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Gagal update status booking." });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Booking tidak ditemukan." });

    return res
      .status(200)
      .json({
        success: true,
        message: "Status booking diperbarui.",
        dbId: id,
        status,
      });
  });
});

// DELETE /api/bookings/:id
app.delete("/api/bookings/:id", (req, res) => {
  const id = req.params.id;

  db.getConnection((err, connection) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res
          .status(500)
          .json({ success: false, message: "Kesalahan server." });
      }

      const deleteParticipants =
        "DELETE FROM participants WHERE booking_id = ?";
      connection.query(deleteParticipants, [id], (err) => {
        if (err)
          return connection.rollback(() => {
            connection.release();
            res
              .status(500)
              .json({ success: false, message: "Gagal hapus peserta." });
          });

        const deleteBooking = "DELETE FROM bookings WHERE id = ?";
        connection.query(deleteBooking, [id], (err) => {
          if (err)
            return connection.rollback(() => {
              connection.release();
              res
                .status(500)
                .json({ success: false, message: "Gagal hapus booking." });
            });

          connection.commit((err) => {
            if (err)
              return connection.rollback(() => {
                connection.release();
                res
                  .status(500)
                  .json({ success: false, message: "Kesalahan server." });
              });
            connection.release();
            return res
              .status(200)
              .json({ success: true, message: "Booking berhasil dihapus." });
          });
        });
      });
    });
  });
});

app.get("/api/packages", (req, res) => {
  const { city, code } = req.query;

  let sql = `
    SELECT 
      p.id, 
      p.name AS package_name, 
      p.name AS name, 
      p.description,
      p.price, 
      p.imageUrl, 
      p.duration,
      c.city_name, 
      c.city_code
    FROM packages p
    JOIN cities c ON p.city_id = c.id
  `;
  const params = [];

  if (city) {
    sql += " WHERE c.city_name = ?";
    params.push(city);
  } else if (code) {
    sql += " WHERE c.city_code = ?";
    params.push(code);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching packages:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Ambil daftar kota
app.get("/api/cities", (req, res) => {
  const sql = "SELECT id, city_name, city_code FROM cities";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching cities:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// PUT /api/packages/:id
app.put("/api/packages/:id", (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    city_id, 
    trip_code, 
    description, 
    price, 
    imageUrl, 
    duration, 
    max_participants, 
    is_active 
  } = req.body;

  const sql = `
    UPDATE packages 
    SET name = ?, city_id = ?, trip_code = ?, description = ?, price = ?, 
        imageUrl = ?, duration = ?, max_participants = ?, is_active = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(
    sql, 
    [name, city_id, trip_code, description, price, imageUrl, duration, max_participants, is_active, id],
    (err, result) => {
      if (err) {
        console.error("Error updating package:", err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Package not found" });
      }
      res.json({ message: "Package updated successfully" });
    }
  );
});

// DELETE /api/packages/:id
app.delete("/api/packages/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM packages WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting package:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json({ message: "Package deleted successfully" });
  });
});

// ------------------ TRANSACTIONS ------------------
app.post("/api/transactions", (req, res) => {
  const { bookingDbId, payment_type, amount_paid, payment_method, va_number } =
    req.body;
  if (!bookingDbId || !payment_type || amount_paid == null)
    return res
      .status(400)
      .json({ success: false, message: "Data transaksi tidak lengkap." });

  db.getConnection((err, connection) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res
          .status(500)
          .json({ success: false, message: "Kesalahan server." });
      }

      const insertTransactionSql = `
        INSERT INTO transactions (booking_id, payment_type, amount_paid, payment_method, va_number, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      connection.query(
        insertTransactionSql,
        [
          bookingDbId,
          payment_type,
          amount_paid,
          payment_method || null,
          va_number || null,
        ],
        (err) => {
          if (err)
            return connection.rollback(() => {
              connection.release();
              res
                .status(500)
                .json({
                  success: false,
                  message: "Gagal menyimpan transaksi.",
                });
            });

          const newStatus = payment_type === "dp" ? "dp_lunas" : "selesai";
          const updateBookingSql =
            "UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?";
          connection.query(
            updateBookingSql,
            [newStatus, bookingDbId],
            (err) => {
              if (err)
                return connection.rollback(() => {
                  connection.release();
                  res
                    .status(500)
                    .json({
                      success: false,
                      message: "Gagal update status booking.",
                    });
                });

              connection.commit((err) => {
                if (err)
                  return connection.rollback(() => {
                    connection.release();
                    res
                      .status(500)
                      .json({ success: false, message: "Kesalahan server." });
                  });
                connection.release();
                return res
                  .status(201)
                  .json({
                    success: true,
                    message: "Pembayaran berhasil dicatat!",
                    status: newStatus,
                  });
              });
            }
          );
        }
      );
    });
  });
});

// ------------------ SCANNER ------------------
app.post("/api/bookings/scan", (req, res) => {
  const { participantId } = req.body;
  if (!participantId)
    return res
      .status(400)
      .json({ success: false, message: "ID Peserta tidak boleh kosong." });

  const findSql = "SELECT * FROM participants WHERE id = ?";
  db.query(findSql, [participantId], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });
    if (results.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "TIKET TIDAK DITEMUKAN" });

    const participant = results[0];
    if (participant.status === "sudah_digunakan")
      return res
        .status(409)
        .json({
          success: false,
          message: "TIKET SUDAH DIGUNAKAN",
          name: participant.name,
        });
    if (participant.status === "hangus")
      return res
        .status(410)
        .json({
          success: false,
          message: "TIKET HANGUS/BATAL",
          name: participant.name,
        });

    if (participant.status === "valid") {
      const updateSql =
        "UPDATE participants SET status = 'sudah_digunakan', scanned_at = NOW() WHERE id = ?";
      db.query(updateSql, [participantId], (err) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Gagal update status tiket." });
        return res
          .status(200)
          .json({
            success: true,
            message: "VALIDASI BERHASIL",
            name: participant.name,
          });
      });
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: "Status tiket tidak valid untuk check-in.",
        });
    }
  });
});

// ------------------ USERS ------------------
// GET /api/users
app.get("/api/users", (req, res) => {
  db.query(
    "SELECT id, username, full_name, email, created_at FROM users",
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Kesalahan server." });
      res.status(200).json({ success: true, data: results });
    }
  );
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
          return res.status(409).json({
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

      res.status(200).json({
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

// ================== API UNTUK BUKU TAMU ==================

// Simpan data peserta
app.post("/api/peserta", (req, res) => {
  const { nama, alamat, tempat_lahir, tanggal_lahir, telepon, tujuan } = req.body;
  const tanggal = new Date().toISOString().split('T')[0];
  
  const sql = `
    INSERT INTO peserta (nama, alamat, tempat_lahir, tanggal_lahir, telepon, tujuan, tanggal)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    sql,
    [nama, alamat, tempat_lahir, tanggal_lahir, telepon, tujuan, tanggal],
    (err, result) => {
      if (err) {
        console.error("Error saving peserta:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ 
        message: "Data peserta berhasil disimpan",
        id: result.insertId 
      });
    }
  );
});

app.post("/api/marketing", upload.single("foto_kunjungan"), (req, res) => {
  const {
    nama, alamat, perusahaan, nama_kordinator, kota_kordinator,
    rencana_wisata, rencana_pemberangkatan, destinasi_tujuan,
    jenis_trip, telepon, catatan
  } = req.body;

  const tanggal = new Date().toISOString().split("T")[0];
  const foto_kunjungan = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO marketing 
    (tanggal, nama, alamat, perusahaan, nama_kordinator, kota_kordinator, 
     rencana_wisata, rencana_pemberangkatan, destinasi_tujuan, 
     jenis_trip, telepon, foto_kunjungan, catatan)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      tanggal, nama, alamat, perusahaan, nama_kordinator, kota_kordinator,
      rencana_wisata, rencana_pemberangkatan, destinasi_tujuan,
      jenis_trip, telepon, foto_kunjungan, catatan
    ],
    (err, result) => {
      if (err) {
        console.error("Error saving marketing:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Data marketing berhasil disimpan",
        id: result.insertId
      });
    }
  );
});

// Ambil data peserta dengan pagination
app.get("/api/peserta", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const countQuery = "SELECT COUNT(*) as total FROM peserta";
  const dataQuery = "SELECT * FROM peserta ORDER BY created_at DESC LIMIT ? OFFSET ?";
  
  db.query(countQuery, (err, countResult) => {
    if (err) {
      console.error("Error counting peserta:", err);
      return res.status(500).json({ error: err.message });
    }
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    db.query(dataQuery, [limit, offset], (err, dataResult) => {
      if (err) {
        console.error("Error fetching peserta:", err);
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        data: dataResult,
        totalPages: totalPages,
        currentPage: page,
        totalItems: total
      });
    });
  });
});

// Ambil data marketing dengan pagination
app.get("/api/marketing", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const countQuery = "SELECT COUNT(*) as total FROM marketing";
  const dataQuery = "SELECT * FROM marketing ORDER BY created_at DESC LIMIT ? OFFSET ?";
  
  db.query(countQuery, (err, countResult) => {
    if (err) {
      console.error("Error counting marketing:", err);
      return res.status(500).json({ error: err.message });
    }
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    db.query(dataQuery, [limit, offset], (err, dataResult) => {
      if (err) {
        console.error("Error fetching marketing:", err);
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        data: dataResult,
        totalPages: totalPages,
        currentPage: page,
        totalItems: total
      });
    });
  });
});

// ================== API UNTUK STATISTIK ==================

// Statistik peserta
app.get("/api/stats/peserta", (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];
  
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfWeekFormatted = startOfWeek.toISOString().split('T')[0];
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthFormatted = startOfMonth.toISOString().split('T')[0];
  
  const queries = [
    db.promise().query('SELECT COUNT(*) as count FROM peserta WHERE tanggal = ?', [today]),
    db.promise().query('SELECT COUNT(*) as count FROM peserta WHERE tanggal = ?', [yesterdayFormatted]),
    db.promise().query('SELECT COUNT(*) as count FROM peserta WHERE tanggal >= ?', [startOfWeekFormatted]),
    db.promise().query('SELECT COUNT(*) as count FROM peserta WHERE tanggal >= ?', [startOfMonthFormatted]),
    db.promise().query('SELECT COUNT(*) as count FROM peserta')
  ];
  
  Promise.all(queries)
    .then(results => {
      res.json({
        today: results[0][0][0].count,
        yesterday: results[1][0][0].count,
        week: results[2][0][0].count,
        month: results[3][0][0].count,
        total: results[4][0][0].count
      });
    })
    .catch(err => {
      console.error("Error fetching peserta stats:", err);
      res.status(500).json({ error: err.message });
    });
});

// Statistik marketing
app.get("/api/stats/marketing", (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];
  
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfWeekFormatted = startOfWeek.toISOString().split('T')[0];
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthFormatted = startOfMonth.toISOString().split('T')[0];
  
  const queries = [
    db.promise().query('SELECT COUNT(*) as count FROM marketing WHERE tanggal = ?', [today]),
    db.promise().query('SELECT COUNT(*) as count FROM marketing WHERE tanggal = ?', [yesterdayFormatted]),
    db.promise().query('SELECT COUNT(*) as count FROM marketing WHERE tanggal >= ?', [startOfWeekFormatted]),
    db.promise().query('SELECT COUNT(*) as count FROM marketing WHERE tanggal >= ?', [startOfMonthFormatted]),
    db.promise().query('SELECT COUNT(*) as count FROM marketing')
  ];
  
  Promise.all(queries)
    .then(results => {
      res.json({
        today: results[0][0][0].count,
        yesterday: results[1][0][0].count,
        week: results[2][0][0].count,
        month: results[3][0][0].count,
        total: results[4][0][0].count
      });
    })
    .catch(err => {
      console.error("Error fetching marketing stats:", err);
      res.status(500).json({ error: err.message });
    });
});

// ================== API UNTUK ADMIN ==================

// Ambil semua data peserta untuk admin
app.get("/api/admin/peserta", (req, res) => {
  db.query("SELECT * FROM peserta ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("Error fetching peserta:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Ambil semua data marketing untuk admin
app.get("/api/admin/marketing", (req, res) => {
  db.query("SELECT * FROM marketing ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("Error fetching marketing:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Hapus data peserta
app.delete("/api/admin/peserta/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM peserta WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting peserta:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Data peserta berhasil dihapus" });
  });
});

// Hapus data marketing
app.delete("/api/admin/marketing/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM marketing WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting marketing:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Data marketing berhasil dihapus" });
  });
});

// Edit data peserta
app.put("/api/admin/peserta/:id", (req, res) => {
  const { id } = req.params;
  const { nama, alamat, tempat_lahir, tanggal_lahir, telepon, tujuan } = req.body;
  
  const sql = `
    UPDATE peserta 
    SET nama = ?, alamat = ?, tempat_lahir = ?, tanggal_lahir = ?, telepon = ?, tujuan = ?
    WHERE id = ?
  `;
  
  db.query(
    sql,
    [nama, alamat, tempat_lahir, tanggal_lahir, telepon, tujuan, id],
    (err, result) => {
      if (err) {
        console.error("Error updating peserta:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Data peserta berhasil diupdate" });
    }
  );
});

// Edit data marketing
app.put("/api/admin/marketing/:id", upload.single('foto_kunjungan'), (req, res) => {
  const { id } = req.params;
  const {
    nama, perusahaan, alamat, nama_kordinator, kota_kordinator,
    rencana_wisata, rencana_pemberangkatan, destinasi_tujuan,
    jenis_trip, telepon, catatan
  } = req.body;
  
  let sql, params;
  
  if (req.file) {
    const foto_kunjungan = req.file.filename;
    sql = `
      UPDATE marketing 
      SET nama = ?, perusahaan = ?, alamat = ?, nama_kordinator = ?, kota_kordinator = ?,
          rencana_wisata = ?, rencana_pemberangkatan = ?, destinasi_tujuan = ?,
          jenis_trip = ?, telepon = ?, foto_kunjungan = ?, catatan = ?
      WHERE id = ?
    `;
    params = [
      nama, perusahaan, alamat, nama_kordinator, kota_kordinator,
      rencana_wisata, rencana_pemberangkatan, destinasi_tujuan,
      jenis_trip, telepon, foto_kunjungan, catatan, id
    ];
  } else {
    sql = `
      UPDATE marketing 
      SET nama = ?, perusahaan = ?, alamat = ?, nama_kordinator = ?, kota_kordinator = ?,
          rencana_wisata = ?, rencana_pemberangkatan = ?, destinasi_tujuan = ?,
          jenis_trip = ?, telepon = ?, catatan = ?
      WHERE id = ?
    `;
    params = [
      nama, perusahaan, alamat, nama_kordinator, kota_kordinator,
      rencana_wisata, rencana_pemberangkatan, destinasi_tujuan,
      jenis_trip, telepon, catatan, id
    ];
  }
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating marketing:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Data marketing berhasil diupdate" });
  });
});

// ------------------ SERVER LISTEN ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
