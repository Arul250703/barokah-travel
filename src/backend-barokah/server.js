const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");

dotenv.config();

// Database connection pool (lebih baik dari single connection)
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🎉 Server backend Barokah Tour berhasil berjalan!");
});

// GET all bookings (untuk halaman Keuangan & QR Page)
app.get("/api/bookings", (req, res) => {
  console.log("📥 GET /api/bookings - Mengambil semua booking...");

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
      console.error("❌ Error fetching bookings:", err);
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengambil data booking." });
    }

    if (bookings.length === 0) {
      console.log("ℹ️  Tidak ada booking ditemukan");
      return res.json({ success: true, data: [] });
    }

    // Ambil semua peserta untuk semua booking yang ditemukan
    const bookingIds = bookings.map((b) => b.id);
    const participantsQuery = `
            SELECT id AS participant_id, booking_id, name, phone, status AS ticket_status 
            FROM participants WHERE booking_id IN (?)
        `;

    db.query(participantsQuery, [bookingIds], (err, participants) => {
      if (err) {
        console.error("❌ Error fetching participants:", err);
        return res
          .status(500)
          .json({ success: false, message: "Gagal mengambil data peserta." });
      }

      // Gabungkan data peserta ke booking yang sesuai
      const bookingsWithParticipants = bookings.map((booking) => {
        return {
          ...booking,
          participants: participants.filter((p) => p.booking_id === booking.id),
        };
      });

      console.log(`✅ Berhasil mengambil ${bookings.length} booking`);
      res.status(200).json({ success: true, data: bookingsWithParticipants });
    });
  });
});

// Login endpoint
app.post("/api/login", (req, res) => {
  console.log("📥 POST /api/login - Proses login...");

  const { username, password } = req.body;

  if (!username || !password) {
    console.log("❌ Login gagal: Data tidak lengkap");
    return res
      .status(400)
      .json({ success: false, message: "Username dan password harus diisi." });
  }

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("❌ Database error pada login:", err);
      return res
        .status(500)
        .json({ success: false, message: "Terjadi kesalahan pada server." });
    }

    if (results.length > 0) {
      console.log("✅ Login berhasil untuk user:", username);
      res.status(200).json({ success: true, message: "Login berhasil!" });
    } else {
      console.log("❌ Login gagal: Kredensial salah untuk user:", username);
      res
        .status(401)
        .json({ success: false, message: "Username atau password salah." });
    }
  });
});

// Booking endpoint (membuat booking baru) - IMPLEMENTASI LENGKAP
app.post("/api/bookings", (req, res) => {
  console.log("📥 POST /api/bookings - Menerima permintaan booking baru...");
  console.log("📋 Data yang diterima:", JSON.stringify(req.body, null, 2));

  const {
    package_id,
    customer_name,
    customer_email,
    total_price,
    participants,
  } = req.body;

  // Validasi input
  if (!package_id) {
    console.log("❌ Validasi gagal: package_id kosong");
    return res
      .status(400)
      .json({ success: false, message: "Package ID tidak boleh kosong." });
  }

  if (!customer_name) {
    console.log("❌ Validasi gagal: customer_name kosong");
    return res
      .status(400)
      .json({ success: false, message: "Nama customer tidak boleh kosong." });
  }

  if (!customer_email) {
    console.log("❌ Validasi gagal: customer_email kosong");
    return res
      .status(400)
      .json({ success: false, message: "Email customer tidak boleh kosong." });
  }

  if (
    !participants ||
    !Array.isArray(participants) ||
    participants.length === 0
  ) {
    console.log("❌ Validasi gagal: participants tidak valid");
    return res.status(400).json({
      success: false,
      message: "Data peserta tidak valid atau kosong.",
    });
  }

  if (total_price === undefined || total_price === null) {
    console.log("❌ Validasi gagal: total_price kosong");
    return res
      .status(400)
      .json({ success: false, message: "Total harga tidak boleh kosong." });
  }

  // Validasi setiap participant
  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    if (!p.name || !p.phone || !p.address || !p.birth_place) {
      console.log(`❌ Validasi gagal: Data peserta ${i + 1} tidak lengkap:`, p);
      return res.status(400).json({
        success: false,
        message: `Data peserta ${
          i + 1
        } tidak lengkap. Pastikan nama, telepon, alamat, dan tempat lahir terisi.`,
      });
    }
  }

  console.log("✅ Validasi berhasil, memulai transaksi database...");

  db.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Gagal mendapatkan koneksi database:", err);
      return res.status(500).json({
        success: false,
        message: "Kesalahan server saat koneksi database.",
      });
    }

    console.log("🔗 Koneksi database berhasil, memulai transaksi...");

    connection.beginTransaction((err) => {
      if (err) {
        console.error("❌ Gagal memulai transaksi:", err);
        connection.release();
        return res
          .status(500)
          .json({ success: false, message: "Gagal memulai transaksi." });
      }

      console.log("🔄 Transaksi dimulai, mengambil kode paket...");

      // Ambil kode paket dan kota
      const getCodesQuery =
        "SELECT p.trip_code, c.city_code FROM packages p JOIN cities c ON p.city_id = c.id WHERE p.id = ?";

      connection.query(getCodesQuery, [package_id], (err, results) => {
        if (err) {
          console.error("❌ Error mengambil kode paket:", err);
          return connection.rollback(() => {
            connection.release();
            res
              .status(500)
              .json({ success: false, message: "Gagal mengambil data paket." });
          });
        }

        if (results.length === 0) {
          console.log("❌ Paket tidak ditemukan untuk ID:", package_id);
          return connection.rollback(() => {
            connection.release();
            res
              .status(404)
              .json({ success: false, message: "Paket tidak ditemukan." });
          });
        }

        const { city_code, trip_code } = results[0];
        const unique_id = uuidv4().split("-")[0].toUpperCase();
        const newBookingId = `${city_code}-${trip_code}-${unique_id}`;

        console.log("🆔 Booking ID baru dibuat:", newBookingId);
        console.log("💾 Menyimpan data booking...");

        const bookingSql = `INSERT INTO bookings (booking_id, package_id, customer_name, customer_email, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, 'selesai', NOW())`;
        const bookingValues = [
          newBookingId,
          package_id,
          customer_name,
          customer_email,
          total_price,
        ];

        connection.query(bookingSql, bookingValues, (err, result) => {
          if (err) {
            console.error("❌ Error menyimpan booking:", err);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({
                success: false,
                message: "Gagal menyimpan data pemesanan.",
              });
            });
          }

          const newBookingPrimaryKey = result.insertId;
          console.log("✅ Booking tersimpan dengan ID:", newBookingPrimaryKey);
          console.log("👥 Menyimpan data peserta...");

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

          console.log("📊 Data peserta yang akan disimpan:", participantValues);

          connection.query(
            participantSql,
            [participantValues],
            (err, result) => {
              if (err) {
                console.error("❌ Error menyimpan peserta:", err);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({
                    success: false,
                    message: "Gagal menyimpan data peserta.",
                  });
                });
              }

              console.log("✅ Data peserta tersimpan, melakukan commit...");

              connection.commit((err) => {
                if (err) {
                  console.error("❌ Error saat commit:", err);
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      success: false,
                      message: "Kesalahan server saat commit.",
                    });
                  });
                }

                console.log("🎉 Transaksi berhasil! Booking ID:", newBookingId);
                connection.release();
                res.status(201).json({
                  success: true,
                  message: "Pemesanan berhasil dibuat!",
                  bookingId: newBookingId,
                });
              });
            }
          );
        });
      });
    });
  });
});

// GET booking by ID
app.get("/api/bookings/:bookingId", (req, res) => {
  console.log("📥 GET /api/bookings/:bookingId - Mengambil detail booking...");

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
      console.error("❌ Error mengambil booking:", err);
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });
    }

    if (results.length === 0) {
      console.log("❌ Booking tidak ditemukan:", bookingId);
      return res
        .status(404)
        .json({ success: false, message: "Booking tidak ditemukan." });
    }

    const booking = results[0];
    const participantsQuery =
      "SELECT id AS participant_id, name, phone, status AS ticket_status FROM participants WHERE booking_id = ?";

    db.query(participantsQuery, [booking.id], (err, participants) => {
      if (err) {
        console.error("❌ Error mengambil peserta:", err);
        return res
          .status(500)
          .json({ success: false, message: "Gagal mengambil data peserta." });
      }

      booking.participants = participants;
      console.log("✅ Detail booking berhasil diambil:", bookingId);
      res.status(200).json(booking);
    });
  });
});

// ================ IMPLEMENTASI UPDATE BOOKING ================
app.put("/api/bookings/:id", (req, res) => {
  console.log("📥 PUT /api/bookings/:id - Update booking...");

  const bookingId = req.params.id;
  const { package_name, customer_email, total_price, payment_status } =
    req.body;

  console.log("📋 Data update yang diterima:", {
    bookingId,
    package_name,
    customer_email,
    total_price,
    payment_status,
  });

  // Validasi input
  if (!customer_email) {
    console.log("❌ Validasi gagal: customer_email kosong");
    return res.status(400).json({
      success: false,
      message: "Email customer tidak boleh kosong.",
    });
  }

  if (total_price === undefined || total_price === null || total_price < 0) {
    console.log("❌ Validasi gagal: total_price tidak valid");
    return res.status(400).json({
      success: false,
      message: "Total harga tidak valid.",
    });
  }

  // Cek apakah booking exists
  const checkBookingQuery = "SELECT id FROM bookings WHERE id = ?";

  db.query(checkBookingQuery, [bookingId], (err, results) => {
    if (err) {
      console.error("❌ Error checking booking existence:", err);
      return res.status(500).json({
        success: false,
        message: "Kesalahan server saat validasi.",
      });
    }

    if (results.length === 0) {
      console.log("❌ Booking tidak ditemukan untuk update:", bookingId);
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan.",
      });
    }

    // Update booking data
    const updateQuery = `
      UPDATE bookings 
      SET customer_email = ?, total_price = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const updateValues = [
      customer_email,
      total_price,
      payment_status || "menunggu_pembayaran",
      bookingId,
    ];

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error("❌ Error updating booking:", err);
        return res.status(500).json({
          success: false,
          message: "Gagal mengupdate data booking.",
        });
      }

      if (result.affectedRows === 0) {
        console.log("❌ Tidak ada data yang diupdate:", bookingId);
        return res.status(404).json({
          success: false,
          message: "Data booking tidak ditemukan atau tidak berubah.",
        });
      }

      console.log("✅ Booking berhasil diupdate:", bookingId);
      res.status(200).json({
        success: true,
        message: "Data booking berhasil diupdate!",
      });
    });
  });
});

// ================ IMPLEMENTASI DELETE BOOKING ================
app.delete("/api/bookings/:id", (req, res) => {
  console.log("📥 DELETE /api/bookings/:id - Hapus booking...");

  const bookingId = req.params.id;

  console.log("🗑️ Menghapus booking ID:", bookingId);

  // Gunakan transaction untuk memastikan data consistency
  db.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Gagal mendapatkan koneksi database:", err);
      return res.status(500).json({
        success: false,
        message: "Kesalahan server saat koneksi database.",
      });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("❌ Gagal memulai transaksi:", err);
        connection.release();
        return res.status(500).json({
          success: false,
          message: "Gagal memulai transaksi.",
        });
      }

      // Cek apakah booking exists
      const checkBookingQuery =
        "SELECT id, booking_id FROM bookings WHERE id = ?";

      connection.query(checkBookingQuery, [bookingId], (err, results) => {
        if (err) {
          console.error("❌ Error checking booking existence:", err);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({
              success: false,
              message: "Kesalahan server saat validasi.",
            });
          });
        }

        if (results.length === 0) {
          console.log("❌ Booking tidak ditemukan untuk delete:", bookingId);
          return connection.rollback(() => {
            connection.release();
            res.status(404).json({
              success: false,
              message: "Booking tidak ditemukan.",
            });
          });
        }

        const bookingData = results[0];
        console.log("🔍 Booking ditemukan:", bookingData.booking_id);

        // Delete participants terlebih dahulu (foreign key constraint)
        const deleteParticipantsQuery =
          "DELETE FROM participants WHERE booking_id = ?";

        connection.query(
          deleteParticipantsQuery,
          [bookingId],
          (err, result) => {
            if (err) {
              console.error("❌ Error deleting participants:", err);
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  success: false,
                  message: "Gagal menghapus data peserta.",
                });
              });
            }

            console.log(`✅ ${result.affectedRows} peserta dihapus`);

            // Sekarang delete booking
            const deleteBookingQuery = "DELETE FROM bookings WHERE id = ?";

            connection.query(deleteBookingQuery, [bookingId], (err, result) => {
              if (err) {
                console.error("❌ Error deleting booking:", err);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({
                    success: false,
                    message: "Gagal menghapus data booking.",
                  });
                });
              }

              if (result.affectedRows === 0) {
                console.log("❌ Tidak ada booking yang dihapus:", bookingId);
                return connection.rollback(() => {
                  connection.release();
                  res.status(404).json({
                    success: false,
                    message: "Data booking tidak ditemukan.",
                  });
                });
              }

              // Commit transaction
              connection.commit((err) => {
                if (err) {
                  console.error("❌ Error saat commit delete:", err);
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      success: false,
                      message: "Kesalahan server saat commit.",
                    });
                  });
                }

                console.log(
                  "🎉 Booking berhasil dihapus:",
                  bookingData.booking_id
                );
                connection.release();
                res.status(200).json({
                  success: true,
                  message: `Booking #${bookingData.booking_id} berhasil dihapus!`,
                });
              });
            });
          }
        );
      });
    });
  });
});

// Validasi participant untuk scanner
app.post("/api/validate-participant ", (req, res) => {
  console.log("📥 POST /api/validate-participant - Validasi tiket...");

  const { participantId } = req.body;

  if (!participantId) {
    console.log("❌ Validasi gagal: participantId kosong");
    return res
      .status(400)
      .json({ success: false, message: "ID Peserta tidak boleh kosong." });
  }

  const findSql = "SELECT * FROM participants WHERE id = ?";
  db.query(findSql, [participantId], (err, results) => {
    if (err) {
      console.error("❌ Error mencari peserta:", err);
      return res
        .status(500)
        .json({ success: false, message: "Kesalahan server." });
    }

    const participant = results[0];
    if (!participant) {
      console.log("❌ Tiket tidak ditemukan:", participantId);
      return res
        .status(404)
        .json({ success: false, message: "TIKET TIDAK DITEMUKAN" });
    }

    if (participant.status === "sudah_digunakan") {
      console.log("❌ Tiket sudah digunakan:", participantId);
      return res.status(409).json({
        success: false,
        message: "TIKET SUDAH DIGUNAKAN",
        name: participant.name,
      });
    }

    if (participant.status === "hangus") {
      console.log("❌ Tiket hangus:", participantId);
      return res.status(410).json({
        success: false,
        message: "TIKET HANGUS/BATAL",
        name: participant.name,
      });
    }

    if (participant.status === "valid") {
      const updateSql =
        "UPDATE participants SET status = 'sudah_digunakan', scanned_at = NOW() WHERE id = ?";
      db.query(updateSql, [participantId], (err, result) => {
        if (err) {
          console.error("❌ Error update status tiket:", err);
          return res
            .status(500)
            .json({ success: false, message: "Gagal update status tiket." });
        }

        console.log("✅ Validasi berhasil:", participant.name);
        res.status(200).json({
          success: true,
          message: "VALIDASI BERHASIL",
          name: participant.name,
        });
      });
    } else {
      console.log("❌ Status tiket tidak valid:", participant.status);
      res.status(400).json({
        success: false,
        message: "Status tiket tidak valid untuk check-in.",
      });
    }
  });
});

// Laporan keuangan endpoint
app.get("/api/laporan-keuangan", (req, res) => {
  console.log("📥 GET /api/laporan-keuangan - Mengambil laporan keuangan...");

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
      console.error("❌ Error mengambil laporan keuangan:", err);
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengambil laporan keuangan." });
    }

    console.log("✅ Laporan keuangan berhasil diambil");
    res.status(200).json({ success: true, data: results });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server yang tidak terduga.",
  });
});

// Handle 404
app.use((req, res) => {
  console.log("❓ Endpoint tidak ditemukan:", req.method, req.path);
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} tidak ditemukan.`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🖥️ Server berjalan di http://localhost:${PORT}`);
});

// Handle database connection
db.on("connection", function (connection) {
  console.log("✅ Connected to MySQL database dengan ID:", connection.threadId);
});

db.on("error", function (err) {
  console.error("❌ Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("🔄 Mencoba reconnect ke database...");
  } else {
    throw err;
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  db.end(() => {
    console.log("✅ Database connection closed.");
    process.exit(0);
  });
});
