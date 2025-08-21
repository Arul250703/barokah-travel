const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // Library untuk enkripsi password


dotenv.config();

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'barokah_tour',
  timezone: '+07:00'
});

// Import routes (jika ada)
// const ticketRoutes = require('./src/routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes (jika ada ticket routes)
// app.use('/api/tickets', ticketRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('🎉 Server backend Barokah Tour berhasil berjalan!');
});

// Test database connection
app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database connection failed',
        error: err.message 
      });
    }
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      data: results 
    });
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Error pada database:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan pada server.' 
      });
    }

    if (results.length > 0) {
      console.log(`Login berhasil untuk user: ${username}`);
      res.status(200).json({ 
        success: true, 
        message: 'Login berhasil!' 
      });
    } else {
      console.log(`Login gagal untuk user: ${username}`);
      res.status(401).json({ 
        success: false, 
        message: 'Username atau password salah.' 
      });
    }
  });
});

// Booking endpoint
app.post('/api/bookings', (req, res) => {
  const { namaPaket, emailKontak, totalHarga, status, peserta } = req.body;

  // Validasi data
  if (!namaPaket || !emailKontak || !totalHarga || !peserta || !Array.isArray(peserta) || peserta.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Data yang dikirim tidak lengkap. Pastikan semua field terisi dan minimal ada 1 peserta.' 
    });
  }

  db.beginTransaction(err => {
    if (err) {
      console.error('Error memulai transaksi:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Kesalahan server saat memulai transaksi.' 
      });
    }

    const bookingSql = `INSERT INTO bookings 
      (package_name, contact_email, total_price, status, created_at) 
      VALUES (?, ?, ?, ?, NOW())`;
    const bookingValues = [namaPaket, emailKontak, totalHarga, status || 'Pending'];

    db.query(bookingSql, bookingValues, (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error menyimpan booking:', err);
          res.status(500).json({ 
            success: false, 
            message: 'Gagal menyimpan data pemesanan.',
            error: err.message 
          });
        });
      }

      const bookingId = result.insertId;
      const participantSql = `INSERT INTO participants 
        (booking_id, name, phone, address, birth_place, birth_date) 
        VALUES ?`;
      
      const participantValues = peserta.map(p => [
        bookingId,
        p.nama || p.name || '',
        p.telepon || p.phone || '',
        p.alamat || p.address || '',
        p.tempatLahir || p.birth_place || '',
        p.tanggalLahir || p.birth_date || null
      ]);

      db.query(participantSql, [participantValues], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error menyimpan peserta:', err);
            res.status(500).json({ 
              success: false, 
              message: 'Gagal menyimpan data peserta.',
              error: err.message 
            });
          });
        }

        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              console.error('Error saat commit:', err);
              res.status(500).json({ 
                success: false, 
                message: 'Kesalahan server saat commit.',
                error: err.message 
              });
            });
          }
          console.log('Pemesanan baru berhasil disimpan dengan ID:', bookingId);
          res.status(201).json({ 
            success: true, 
            message: 'Pemesanan berhasil dibuat!', 
            bookingId: bookingId 
          });
        });
      });
    });
  });
});

// Laporan keuangan endpoint - DIPERBAIKI
app.get('/api/laporan-keuangan', (req, res) => {
  const sql = `
    SELECT 
      b.id,
      b.package_name as paketTour,
      b.contact_email as email,
      b.total_price as totalTagihan,
      b.status,
      b.created_at as tanggal,
      (SELECT p.name FROM participants p WHERE p.booking_id = b.id LIMIT 1) as namaPelanggan
    FROM bookings b
    ORDER BY b.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error mengambil laporan:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Kesalahan server saat mengambil data.',
        error: err.message 
      });
    }

    // Jika tidak ada data
    if (results.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        message: 'Tidak ada data booking ditemukan.' 
      });
    }

    // Ambil detail peserta untuk setiap booking
    const bookingIds = results.map(row => row.id);
    const participantSql = `
      SELECT 
        booking_id,
        id,
        name,
        phone,
        address,
        birth_place,
        birth_date
      FROM participants 
      WHERE booking_id IN (${bookingIds.map(() => '?').join(',')})
      ORDER BY booking_id, id
    `;

    db.query(participantSql, bookingIds, (err, participants) => {
      if (err) {
        console.error('Error mengambil data peserta:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Kesalahan server saat mengambil data peserta.',
          error: err.message 
        });
      }

      // Group peserta berdasarkan booking_id
      const participantsByBooking = {};
      participants.forEach(participant => {
        if (!participantsByBooking[participant.booking_id]) {
          participantsByBooking[participant.booking_id] = [];
        }
        participantsByBooking[participant.booking_id].push(participant);
      });

      // Gabungkan data booking dengan peserta
      const data = results.map(row => ({
        id: row.id,
        paketTour: row.paketTour || '',
        email: row.email || '',
        totalTagihan: parseFloat(row.totalTagihan) || 0,
        status: row.status || 'Pending',
        tanggal: row.tanggal,
        namaPelanggan: row.namaPelanggan || 'N/A',
        items: participantsByBooking[row.id] || []
      }));
      
      console.log(`Berhasil mengambil ${data.length} data laporan keuangan`);
      res.status(200).json({ 
        success: true, 
        data: data,
        total: data.length 
      });
    });
  });
});

// Update booking endpoint - DIPERBAIKI
app.put('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  const { paketTour, email, totalTagihan, status } = req.body;
  
  // Validasi data
  if (!paketTour || !email || !totalTagihan || !status) {
    return res.status(400).json({ 
      success: false, 
      message: 'Semua field harus diisi.' 
    });
  }
  
  const sql = `UPDATE bookings SET 
    package_name = ?, 
    contact_email = ?, 
    total_price = ?, 
    status = ?,
    updated_at = NOW()
    WHERE id = ?`;
  
  const values = [paketTour, email, parseFloat(totalTagihan), status, bookingId];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error mengupdate booking:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Gagal mengupdate booking.',
        error: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking tidak ditemukan.' 
      });
    }
    
    console.log(`Booking ID ${bookingId} berhasil diupdate`);
    res.status(200).json({ 
      success: true, 
      message: 'Booking berhasil diupdate!' 
    });
  });
});

// Delete booking endpoint - DIPERBAIKI
app.delete('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  
  db.beginTransaction(err => {
    if (err) {
      console.error('Error memulai transaksi delete:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Kesalahan server saat memulai transaksi.',
        error: err.message 
      });
    }

    // Delete peserta terlebih dahulu (foreign key constraint)
    const deleteParticipantsSql = 'DELETE FROM participants WHERE booking_id = ?';
    
    db.query(deleteParticipantsSql, [bookingId], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error menghapus peserta:', err);
          res.status(500).json({ 
            success: false, 
            message: 'Gagal menghapus peserta.',
            error: err.message 
          });
        });
      }

      // Kemudian delete booking
      const deleteBookingSql = 'DELETE FROM bookings WHERE id = ?';
      
      db.query(deleteBookingSql, [bookingId], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error menghapus booking:', err);
            res.status(500).json({ 
              success: false, 
              message: 'Gagal menghapus booking.',
              error: err.message 
            });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ 
              success: false, 
              message: 'Booking tidak ditemukan.' 
            });
          });
        }

        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              console.error('Error commit delete:', err);
              res.status(500).json({ 
                success: false, 
                message: 'Kesalahan server saat commit.',
                error: err.message 
              });
            });
          }
          
          console.log(`Booking ID ${bookingId} berhasil dihapus`);
          res.status(200).json({ 
            success: true, 
            message: 'Booking berhasil dihapus!' 
          });
        });
      });
    });
  });
});

// Get single booking endpoint (tambahan untuk debug)
app.get('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  
  const sql = `
    SELECT 
      b.*,
      p.id as participant_id,
      p.name as participant_name,
      p.phone as participant_phone,
      p.address as participant_address,
      p.birth_place as participant_birth_place,
      p.birth_date as participant_birth_date
    FROM bookings b
    LEFT JOIN participants p ON b.id = p.booking_id
    WHERE b.id = ?
    ORDER BY p.id
  `;
  
  db.query(sql, [bookingId], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Kesalahan server.',
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking tidak ditemukan.' 
      });
    }
    
    // Format data
    const booking = {
      id: results[0].id,
      package_name: results[0].package_name,
      contact_email: results[0].contact_email,
      total_price: results[0].total_price,
      status: results[0].status,
      created_at: results[0].created_at,
      participants: results.filter(r => r.participant_id).map(r => ({
        id: r.participant_id,
        name: r.participant_name,
        phone: r.participant_phone,
        address: r.participant_address,
        birth_place: r.participant_birth_place,
        birth_date: r.participant_birth_date
      }))
    };
    
    res.json({ 
      success: true, 
      data: booking 
    });
  });
});

app.get('/api/users', (req, res) => {
    const sql = "SELECT id, username, full_name, email, created_at FROM users";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });
        res.status(200).json({ success: true, data: results });
    });
});

// POST: Menambah pengguna baru (BAGIAN INI DIPERBAIKI)
app.post('/api/users', (req, res) => {
    // 1. Pastikan nama variabel di sini sama dengan yang dikirim dari frontend
    const { username, password, full_name, email } = req.body;

    if (!username || !password || !full_name || !email) {
        return res.status(400).json({ success: false, message: "Semua field wajib diisi." });
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ success: false, message: "Gagal mengenkripsi password." });
        
        // 2. Pastikan urutan VALUES cocok dengan urutan kolom
        const sql = "INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)";
        db.query(sql, [username, hash, full_name, email], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, message: "Username atau Email sudah digunakan." });
                }
                console.error("Error saat menyimpan pengguna:", err); // Tambahkan log error
                return res.status(500).json({ success: false, message: "Gagal menyimpan pengguna ke database." });
            }
            res.status(201).json({ success: true, message: "Pengguna baru berhasil ditambahkan!" });
        });
    });
});

// PUT: Mengedit pengguna (BAGIAN INI JUGA DIPERBAIKI)
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

// DELETE: Menghapus pengguna (Tidak berubah)
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Gagal menghapus pengguna." });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
        res.status(200).json({ success: true, message: "Pengguna berhasil dihapus!" });
    });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🖥️ Server berjalan di http://localhost:${PORT}`);
});

// Handle database connection
db.connect(err => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    console.log('Database config:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'barokah_tour'
    });
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🔄 Menutup koneksi database...');
  db.end(() => {
    console.log('✅ Database disconnected');
    process.exit(0);
  });
});