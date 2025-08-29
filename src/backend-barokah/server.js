import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import {v4 as uuidv4 } from "uuid";
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Buat folder uploads jika belum ada
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
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

// Koneksi ke database
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "barokah_tour",
  timezone: "+07:00",
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
});

// Cek koneksi
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database gagal terkoneksi:", err);
  } else {
    console.log("Database terkoneksi");
    connection.release();
  }
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

// Simpan data marketing
app.post("/api/marketing", upload.single('foto_kunjungan'), (req, res) => {
  const {
    nama, alamat, perusahaan, nama_kordinator, kota_kordinator,
    rencana_wisata, rencana_pemberangkatan, destinasi_tujuan,
    jenis_trip, telepon, catatan
  } = req.body;
  
  const tanggal = new Date().toISOString().split('T')[0];
  const foto_kunjungan = req.file ? req.file.filename : null;
  
  const sql = `
    INSERT INTO marketing 
    (nama, alamat, perusahaan, nama_kordinator, kota_kordinator, 
     rencana_wisata, rencana_pemberangkatan, destinasi_tujuan, 
     jenis_trip, telepon, foto_kunjungan, catatan, tanggal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    sql,
    [
      nama, alamat, perusahaan, nama_kordinator, kota_kordinator,
      rencana_wisata, rencana_pemberangkatan, destinasi_tujuan,
      jenis_trip, telepon, foto_kunjungan, catatan, tanggal
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

// ================== API UNTUK BOOKING SYSTEM ==================

// Test route
app.get("/", (req, res) => {
  res.send("🎉 Server backend Barokah Tour berhasil berjalan!");
});

// GET all bookings
app.get("/api/bookings", (req, res) => {
  const query = `
    SELECT 
      b.id, 
      b.booking_id, 
      b.customer_name, 
      b.customer_email, 
      b.total_price,
      b.status AS payment_status, 
      b.created_at AS booking_date,
      p.name AS package_name
    FROM bookings AS b
    LEFT JOIN packages AS p ON b.package_id = p.id
    ORDER BY b.created_at DESC
  `;

  db.query(query, (err, bookings) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data booking." });
    }

    if (bookings.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const bookingIds = bookings.map((b) => b.id);
    const participantsQuery = `
      SELECT id AS participant_id, booking_id, name, phone, status AS ticket_status 
      FROM participants WHERE booking_id IN (?)
    `;

    db.query(participantsQuery, [bookingIds], (err, participants) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Gagal mengambil data peserta." });
      }

      const bookingsWithParticipants = bookings.map((booking) => {
        return {
          ...booking,
          participants: participants.filter((p) => p.booking_id === booking.id),
        };
      });

      res.status(200).json({ success: true, data: bookingsWithParticipants });
    });
  });
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password harus diisi." });
  }

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
    }

    if (results.length > 0) {
      res.status(200).json({ success: true, message: "Login berhasil!" });
    } else {
      res.status(401).json({ success: false, message: "Username atau password salah." });
    }
  });
});

// Booking endpoint
app.post("/api/bookings", (req, res) => {
  const {
    package_id,
    customer_name,
    customer_email,
    total_price,
    participants,
  } = req.body;

  if (!package_id || !customer_name || !customer_email || !participants || !Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ success: false, message: "Data tidak lengkap." });
  }

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Kesalahan server saat koneksi database." });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ success: false, message: "Gagal memulai transaksi." });
      }

      const getCodesQuery = "SELECT p.trip_code, c.city_code FROM packages p JOIN cities c ON p.city_id = c.id WHERE p.id = ?";
      connection.query(getCodesQuery, [package_id], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, message: "Gagal mengambil data paket." });
          });
        }

        if (results.length === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(404).json({ success: false, message: "Paket tidak ditemukan." });
          });
        }

        const { city_code, trip_code } = results[0];
        const unique_id = uuidv4().split("-")[0].toUpperCase();
        const newBookingId = `${city_code}-${trip_code}-${unique_id}`;

        const bookingSql = `INSERT INTO bookings (booking_id, package_id, customer_name, customer_email, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, 'selesai', NOW())`;
        const bookingValues = [newBookingId, package_id, customer_name, customer_email, total_price];

        connection.query(bookingSql, bookingValues, (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, message: "Gagal menyimpan data pemesanan." });
            });
          }

          const newBookingPrimaryKey = result.insertId;
          const participantSql = `INSERT INTO participants (booking_id, name, phone, address, birth_place, birth_date, status) VALUES ?`;
          const participantValues = participants.map((p) => [
            newBookingPrimaryKey,
            p.name,
            p.phone,
            p.address,
            p.birth_place,
            p.birth_date || null,
            "valid",
          ]);

          connection.query(participantSql, [participantValues], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, message: "Gagal menyimpan data peserta." });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ success: false, message: "Kesalahan server saat commit." });
                });
              }

              connection.release();
              res.status(201).json({
                success: true,
                message: "Pemesanan berhasil dibuat!",
                bookingId: newBookingId,
              });
            });
          });
        });
      });
    });
  });
});

// GET booking by ID
app.get("/api/bookings/:bookingId", (req, res) => {
  const { bookingId } = req.params;

  const query = `
    SELECT 
      b.id, 
      b.booking_id, 
      b.customer_name, 
      b.customer_email, 
      b.status AS payment_status, 
      p.name AS package_name
    FROM bookings AS b
    LEFT JOIN packages AS p ON b.package_id = p.id
    WHERE b.booking_id = ?
  `;

  db.query(query, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Kesalahan server." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Booking tidak ditemukan." });
    }

    const booking = results[0];
    const participantsQuery = "SELECT id AS participant_id, name, phone, status AS ticket_status FROM participants WHERE booking_id = ?";

    db.query(participantsQuery, [booking.id], (err, participants) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Gagal mengambil data peserta." });
      }

      booking.participants = participants;
      res.status(200).json(booking);
    });
  });
});

// Update booking
app.put("/api/bookings/:id", (req, res) => {
  const bookingId = req.params.id;
  const { package_name, customer_email, total_price, payment_status } = req.body;

  if (!customer_email || total_price === undefined || total_price === null || total_price < 0) {
    return res.status(400).json({ success: false, message: "Data tidak valid." });
  }

  const checkBookingQuery = "SELECT id FROM bookings WHERE id = ?";
  db.query(checkBookingQuery, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Kesalahan server saat validasi." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Booking tidak ditemukan." });
    }

    const updateQuery = `
      UPDATE bookings 
      SET customer_email = ?, total_price = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const updateValues = [customer_email, total_price, payment_status || "menunggu_pembayaran", bookingId];

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Gagal mengupdate data booking." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Data booking tidak ditemukan atau tidak berubah." });
      }

      res.status(200).json({ success: true, message: "Data booking berhasil diupdate!" });
    });
  });
});

// Delete booking
app.delete("/api/bookings/:id", (req, res) => {
  const bookingId = req.params.id;

  db.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Kesalahan server saat koneksi database." });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ success: false, message: "Gagal memulai transaksi." });
      }

      const checkBookingQuery = "SELECT id, booking_id FROM bookings WHERE id = ?";
      connection.query(checkBookingQuery, [bookingId], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, message: "Kesalahan server saat validasi." });
          });
        }

        if (results.length === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(404).json({ success: false, message: "Booking tidak ditemukan." });
          });
        }

        const bookingData = results[0];
        const deleteParticipantsQuery = "DELETE FROM participants WHERE booking_id = ?";
        connection.query(deleteParticipantsQuery, [bookingId], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, message: "Gagal menghapus data peserta." });
            });
          }

          const deleteBookingQuery = "DELETE FROM bookings WHERE id = ?";
          connection.query(deleteBookingQuery, [bookingId], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, message: "Gagal menghapus data booking." });
              });
            }

            if (result.affectedRows === 0) {
              return connection.rollback(() => {
                connection.release();
                res.status(404).json({ success: false, message: "Data booking tidak ditemukan." });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ success: false, message: "Kesalahan server saat commit." });
                });
              }

              connection.release();
              res.status(200).json({
                success: true,
                message: `Booking #${bookingData.booking_id} berhasil dihapus!`,
              });
            });
          });
        });
      });
    });
  });
});

// Validasi participant
app.post("/api/validate", (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    return res.status(400).json({ success: false, message: "ID Peserta tidak boleh kosong." });
  }

  const findSql = "SELECT * FROM participants WHERE id = ?";
  db.query(findSql, [participantId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Kesalahan server." });
    }

    const participant = results[0];
    if (!participant) {
      return res.status(404).json({ success: false, message: "TIKET TIDAK DITEMUKAN" });
    }

    if (participant.status === "sudah_digunakan") {
      return res.status(409).json({
        success: false,
        message: "TIKET SUDAH DIGUNAKAN",
        name: participant.name,
      });
    }

    if (participant.status === "hangus") {
      return res.status(410).json({
        success: false,
        message: "TIKET HANGUS/BATAL",
        name: participant.name,
      });
    }

    if (participant.status === "valid") {
      const updateSql = "UPDATE participants SET status = 'sudah_digunakan', scanned_at = NOW() WHERE id = ?";
      db.query(updateSql, [participantId], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Gagal update status tiket." });
        }

        res.status(200).json({
          success: true,
          message: "VALIDASI BERHASIL",
          name: participant.name,
        });
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Status tiket tidak valid untuk check-in.",
      });
    }
  });
});

// Laporan keuangan
app.get("/api/laporan-keuangan", (req, res) => {
  const query = `
    SELECT 
      DATE(created_at) as tanggal,
      COUNT(*) as jumlah_booking,
      SUM(total_price) as total_pendapatan
    FROM bookings 
    WHERE status = 'selesai'
    GROUP BY DATE(created_at)
    ORDER BY tanggal DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal mengambil laporan keuangan." });
    }

    res.status(200).json({ success: true, data: results });
  });
});

// Users management
const saltRounds = 10;

app.get('/api/users', (req, res) => {
  const sql = "SELECT id, username, full_name, email, created_at FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });
    res.status(200).json({ success: true, data: results });
  });
});

app.post('/api/users', (req, res) => {
  const { username, password, full_name, email } = req.body;

  if (!username || !password || !full_name || !email) {
    return res.status(400).json({ success: false, message: "Semua field wajib diisi." });
  }

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal mengenkripsi password." });
    
    const sql = "INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)";
    db.query(sql, [username, hash, full_name, email], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ success: false, message: "Username atau Email sudah digunakan." });
        }
        return res.status(500).json({ success: false, message: "Gagal menyimpan pengguna ke database." });
      }
      res.status(201).json({ success: true, message: "Pengguna baru berhasil ditambahkan!" });
    });
  });
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username, password, full_name, email } = req.body;

  if (!password) {
    const sql = "UPDATE users SET username = ?, full_name = ?, email = ? WHERE id = ?";
    db.query(sql, [username, full_name, email, userId], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Gagal mengupdate pengguna." });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      res.status(200).json({ success: true, message: "Pengguna berhasil diupdate!" });
    });
  } else {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.status(500).json({ success: false, message: "Gagal mengenkripsi password." });
      const sql = "UPDATE users SET username = ?, password = ?, full_name = ?, email = ? WHERE id = ?";
      db.query(sql, [username, hash, full_name, email, userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Gagal mengupdate pengguna." });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
        res.status(200).json({ success: true, message: "Pengguna berhasil diupdate!" });
      });
    });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal menghapus pengguna." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    res.status(200).json({ success: true, message: "Pengguna berhasil dihapus!" });
  });
});

// Transactions
app.post('/api/transactions', (req, res) => {
  const { booking_id, payment_type, amount_paid, payment_method, va_number } = req.body;

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        return res.status(500).json({ success: false, message: "Kesalahan server." });
      }

      const transactionSql = "INSERT INTO transactions (booking_id, payment_type, amount_paid, payment_method, va_number) VALUES (?, ?, ?, ?, ?)";
      const transactionValues = [booking_id, payment_type, amount_paid, payment_method, va_number];

      connection.query(transactionSql, transactionValues, (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ success: false, message: "Gagal menyimpan data transaksi." });
          });
        }

        const newStatus = payment_type === 'dp' ? 'DP' : 'Lunas';
        const updateBookingSql = "UPDATE bookings SET status = ? WHERE id = ?";
        
        connection.query(updateBookingSql, [newStatus, booking_id], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ success: false, message: "Gagal mengupdate status booking." });
            });
          }

          connection.commit(err => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ success: false, message: "Kesalahan server." });
              });
            }
            connection.release();
            res.status(201).json({ success: true, message: "Pembayaran berhasil dicatat!" });
          });
        });
      });
    });
  });
});

// ================== ERROR HANDLING ==================

app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server yang tidak terduga.",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan.`,
  });
});

// ================== SERVER START ==================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🖥️ Server berjalan di http://localhost:${PORT}`);
});

// Database event handlers
db.on("connection", function (connection) {
  console.log("✅ Connected to MySQL database dengan ID:", connection.threadId);
});

db.on("error", function (err) {
  console.error("❌ Database error:", err);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  db.end(() => {
    console.log("✅ Database connection closed.");
    process.exit(0);
  });
});