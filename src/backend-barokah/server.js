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

// ------------------ Helper ------------------
function genRandomSuffix(len = 8) {
  return uuidv4().split("-")[0].slice(0, len).toUpperCase();
}

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
const upload = multer({ storage: storage });

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
    SELECT 
      b.id, 
      b.booking_id, 
      b.customer_name, 
      b.customer_email, 
      p.name AS package_name, 
      b.total_price, 
      b.status, 
      DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as created_at
    FROM bookings b
    LEFT JOIN packages p ON b.package_id = p.id
    ORDER BY b.created_at DESC
  `;
  
  db.query(query, (err, rows) => {
    if (err) {
      console.error("❌ Error mengambil data booking:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Gagal mengambil data booking." 
      });
    }
    
    // Transform status untuk frontend
    const transformedRows = rows.map(row => {
      let statusText = "UNKNOWN";
      if (row.status === "menunggu_pembayaran") statusText = "MENUNGGU PEMBAYARAN";
      else if (row.status === "dp_lunas") statusText = "DP LUNAS";
      else if (row.status === "selesai") statusText = "LUNAS";
      else if (row.status === "dibatalkan") statusText = "DIBATALKAN";
      
      return {
        ...row,
        status_display: statusText
      };
    });
    
    res.status(200).json({ 
      success: true, 
      data: transformedRows 
    });
  });
});

// GET /api/bookings/:id - detail booking & peserta
// GET /api/bookings - semua booking (admin)
// GET /api/bookings - semua booking (admin)
app.get("/api/bookings", (req, res) => {
  const query = `
    SELECT 
      b.id, 
      b.booking_id, 
      b.customer_name, 
      b.customer_email, 
      p.name AS package_name, 
      b.total_price, 
      b.status, 
      DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
      DATE_FORMAT(b.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
    FROM bookings b
    LEFT JOIN packages p ON b.package_id = p.id
    ORDER BY b.created_at DESC
  `;
  
  db.query(query, (err, rows) => {
    if (err) {
      console.error("❌ Error mengambil data booking:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Gagal mengambil data booking." 
      });
    }
    
    // Transform status untuk frontend
    const transformedRows = rows.map(row => {
      let statusText = "UNKNOWN";
      if (row.status === "menunggu_pembayaran") statusText = "MENUNGGU PEMBAYARAN";
      else if (row.status === "dp_lunas") statusText = "DP LUNAS";
      else if (row.status === "selesai") statusText = "LUNAS";
      else if (row.status === "dibatalkan") statusText = "DIBATALKAN";
      
      return {
        ...row,
        status_display: statusText
      };
    });
    
    res.status(200).json({ 
      success: true, 
      data: transformedRows 
    });
  });
});

// GET /api/bookings/:id - detail booking & peserta
app.get("/api/bookings/:id", (req, res) => {
  const id = req.params.id;

  const bookingQuery = `
    SELECT 
      b.id, 
      b.booking_id, 
      p.name AS package_name,
      b.customer_name, 
      b.customer_email, 
      b.total_price, 
      b.status, 
      DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
      DATE_FORMAT(b.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
    FROM bookings b
    LEFT JOIN packages p ON b.package_id = p.id
    WHERE b.id = ?
  `;

  db.query(bookingQuery, [id], (err, bookingRows) => {
    if (err) {
      console.error("❌ Error mengambil detail booking:", err);
      return res.status(500).json({
        success: false,
        message: "Kesalahan server saat mengambil booking.",
      });
    }
    
    if (bookingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan.",
      });
    }

    const booking = bookingRows[0];

    const participantsQuery = `
      SELECT id, name, phone, address, birth_place, status, scanned_at
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

      booking.participants = participantsRows;

      return res.status(200).json({ success: true, data: booking });
    });
  });
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

// PUT /api/bookings/:id - update data booking
app.put("/api/bookings/:id", (req, res) => {
  const id = req.params.id;
  const { customer_name, customer_email, total_price, status } = req.body;

  // Validasi data
  if (!customer_name || !customer_email || total_price === undefined || !status) {
    return res.status(400).json({ 
      success: false, 
      message: "Data tidak lengkap." 
    });
  }

  const sql = `
    UPDATE bookings 
    SET customer_name = ?, customer_email = ?, total_price = ?, status = ?, updated_at = NOW() 
    WHERE id = ?
  `;
  
  db.query(sql, [customer_name, customer_email, total_price, status, id], (err, result) => {
    if (err) {
      console.error("Error updating booking:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Gagal update booking." 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking tidak ditemukan." 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking berhasil diperbarui.",
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
      p.price, 
      p.imageUrl, 
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
      if (err) {
        console.error("❌ Database error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Kesalahan server." });
      }
      res.status(200).json({ success: true, data: results });
    }
  );
});

// POST /api/users - dengan debugging yang lebih baik
app.post("/api/users", (req, res) => {
  console.log("📥 POST /api/users - Creating new user...");
  const { username, password, full_name, email } = req.body;
  
  if (!username || !password || !full_name || !email)
    return res
      .status(400)
      .json({ success: false, message: "Semua field wajib diisi." });

  console.log("🔐 Hashing password...");
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error("❌ Bcrypt hash error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengenkripsi password." });
    }

    console.log("✅ Password hashed successfully");
    console.log("💾 Inserting user to database...");
    
    const sql =
      "INSERT INTO users (username, password, full_name, email, created_at) VALUES (?, ?, ?, ?, NOW())";
    db.query(sql, [username, hash, full_name, email], (err, result) => {
      if (err) {
        console.error("❌ Database insert error:", err);
        if (err.code === "ER_DUP_ENTRY")
          return res.status(409).json({
            success: false,
            message: "Username atau Email sudah digunakan.",
          });
        return res
          .status(500)
          .json({ success: false, message: "Gagal menambahkan user." });
      }
      
      console.log("✅ User created successfully with ID:", result.insertId);
      res.status(201).json({ 
        success: true, 
        message: "User berhasil dibuat!",
        userId: result.insertId
      });
    });
  });
});

// PUT /api/users/:id - Edit user
app.put("/api/users/:id", (req, res) => {
  console.log("📥 PUT /api/users/:id - Editing user...");
  const { id } = req.params;
  const { username, password, full_name, email } = req.body;

  if (!username || !full_name || !email) {
    return res.status(400).json({
      success: false,
      message: "Username, full_name, dan email wajib diisi.",
    });
  }

  // Cek apakah user ada
  db.query("SELECT id FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ success: false, message: "Kesalahan server." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    // ===========================
    // Kalau password ikut diubah
    // ===========================
    if (password && password.trim() !== "") {
      console.log("🔐 Hashing new password...");
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          console.error("❌ Bcrypt hash error:", err);
          return res
            .status(500)
            .json({ success: false, message: "Gagal mengenkripsi password." });
        }

        const sql =
          "UPDATE users SET username = ?, password = ?, full_name = ?, email = ? WHERE id = ?";
        const values = [username, hash, full_name, email, id];
        console.log("📝 SQL Update:", sql, values);

        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("❌ Database update error:", err);
            if (err.code === "ER_DUP_ENTRY") {
              return res.status(409).json({
                success: false,
                message: "Username atau Email sudah digunakan.",
              });
            }
            return res.status(500).json({ success: false, message: "Gagal mengupdate user." });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "User tidak ditemukan atau data sama.",
            });
          }

          console.log("✅ User updated successfully with new password");
          res.status(200).json({
            success: true,
            message: "User berhasil diupdate dengan password baru!",
          });
        });
      });
    } else {
      // ===========================
      // Kalau tanpa ubah password
      // ===========================
      const sql =
        "UPDATE users SET username = ?, full_name = ?, email = ? WHERE id = ?";
      const values = [username, full_name, email, id];
      console.log("📝 SQL Update:", sql, values);

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("❌ Database update error:", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              success: false,
              message: "Username atau Email sudah digunakan.",
            });
          }
          return res.status(500).json({ success: false, message: "Gagal mengupdate user." });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "User tidak ditemukan atau data sama.",
          });
        }

        console.log("✅ User updated successfully without password change");
        res.status(200).json({
          success: true,
          message: "User berhasil diupdate!",
        });
      });
    }
  });
});

// DELETE /api/users/:id - Delete user
app.delete("/api/users/:id", (req, res) => {
  console.log("📥 DELETE /api/users/:id - Deleting user...");
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res
      .status(400)
      .json({ success: false, message: "ID user tidak valid." });
  }

  // Cek apakah user exists
  db.query("SELECT id, username FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });
    }
    
    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    const user = results[0];
    console.log("🗑️ Deleting user:", user.username);

    // Delete user
    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("❌ Database delete error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Gagal menghapus user." });
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User tidak ditemukan." });
      }
      
      console.log("✅ User deleted successfully");
      res.status(200).json({ 
        success: true, 
        message: `User ${user.username} berhasil dihapus!` 
      });
    });
  });
});

// GET /api/users/:id - Get single user
app.get("/api/users/:id", (req, res) => {
  console.log("📥 GET /api/users/:id - Getting single user...");
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res
      .status(400)
      .json({ success: false, message: "ID user tidak valid." });
  }

  const sql = "SELECT id, username, full_name, email, created_at FROM users WHERE id = ? LIMIT 1";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });
    }
    
    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    console.log("✅ User found:", results[0].username);
    res.status(200).json({ 
      success: true, 
      data: results[0] 
    });
  });
});

// POST /api/users/login - Endpoint login yang diperbaiki
app.post("/api/users/login", (req, res) => {
  console.log("📥 POST /api/users/login - Menerima permintaan login...");
  console.log("Request body:", req.body);
  
  const { username, password } = req.body;
  
  // Validasi input
  if (!username || !password) {
    console.log("❌ Username atau password kosong");
    return res
      .status(400)
      .json({ success: false, message: "Username dan password wajib diisi." });
  }

  console.log("🔍 Mencari user dengan username:", username);
  const sql = "SELECT * FROM users WHERE username = ? LIMIT 1";
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });
    }
    
    console.log("🔍 User query results count:", results.length);
    
    if (results.length === 0) {
      console.log("❌ User tidak ditemukan");
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    const user = results[0];
    console.log("👤 User found:", {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      hasPassword: !!user.password
    });
    
    // Cek apakah password di database ada
    if (!user.password) {
      console.log("❌ User tidak memiliki password di database");
      return res
        .status(500)
        .json({ success: false, message: "Data user tidak lengkap." });
    }

    console.log("🔐 Membandingkan password...");
    console.log("Input password length:", password.length);
    console.log("Stored hash length:", user.password.length);
    
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("❌ Bcrypt compare error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Kesalahan server." });
      }
      
      console.log("🔐 Password match result:", isMatch);
      
      if (!isMatch) {
        console.log("❌ Password tidak cocok");
        return res
          .status(401)
          .json({ success: false, message: "Password salah." });
      }

      console.log("✅ Login berhasil untuk user:", user.username);
      
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

// Tambahan endpoint login alternatif untuk kompatibilitas
app.post("/api/login", (req, res) => {
  console.log("📥 POST /api/login - Redirect ke /api/users/login");
  // Redirect ke endpoint yang benar
  req.url = '/api/users/login';
  app._router.handle(req, res);
});

// Endpoint untuk membuat user admin default (hanya untuk development)
app.post("/api/create-admin", (req, res) => {
  console.log("📥 POST /api/create-admin - Creating default admin user...");
  
  const adminData = {
    username: "admin",
    password: "admin123", // Password default
    full_name: "Administrator",
    email: "admin@barokahtour.com"
  };
  
  // Cek apakah admin sudah ada
  db.query("SELECT id FROM users WHERE username = ?", [adminData.username], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ success: false, message: "Kesalahan server." });
    }
    
    if (results.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: "Admin user sudah ada.",
        credentials: {
          username: adminData.username,
          password: adminData.password
        }
      });
    }
    
    // Hash password
    bcrypt.hash(adminData.password, saltRounds, (err, hash) => {
      if (err) {
        console.error("❌ Bcrypt hash error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Gagal mengenkripsi password." 
        });
      }
      
      // Insert admin user
      const sql = "INSERT INTO users (username, password, full_name, email, created_at) VALUES (?, ?, ?, ?, NOW())";
      db.query(sql, [adminData.username, hash, adminData.full_name, adminData.email], (err, result) => {
        if (err) {
          console.error("❌ Database insert error:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Gagal membuat admin user." 
          });
        }
        
        console.log("✅ Admin user created successfully");
        res.status(201).json({ 
          success: true, 
          message: "Admin user berhasil dibuat!",
          credentials: {
            username: adminData.username,
            password: adminData.password
          }
        });
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
  console.log(`📱 Untuk membuat admin user, POST ke: http://localhost:${PORT}/api/create-admin`);
});