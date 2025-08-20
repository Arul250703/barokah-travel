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

// / === API UNTUK MENYIMPAN PEMESANAN ===
app.post('/api/bookings', (req, res) => {
    // Mengambil data dari frontend
    const { namaPaket, emailKontak, totalHarga, status, peserta } = req.body;

    // Validasi sederhana
    if (!namaPaket || !emailKontak || !totalHarga || !peserta) {
        return res.status(400).json({ success: false, message: "Data yang dikirim tidak lengkap." });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error("Error memulai transaksi:", err);
            return res.status(500).json({ success: false, message: "Kesalahan server." });
        }

        // 1. Simpan data utama ke tabel 'bookings'
        const bookingSql = "INSERT INTO bookings (package_name, contact_email, total_price, status) VALUES (?, ?, ?, ?)";
        const bookingValues = [namaPaket, emailKontak, totalHarga, status || 'Pending'];

        db.query(bookingSql, bookingValues, (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error menyimpan booking:", err);
                    res.status(500).json({ success: false, message: "Gagal menyimpan data pemesanan." });
                });
            }

            const bookingId = result.insertId;

            // 2. Simpan setiap peserta ke tabel 'participants'
            const participantSql = "INSERT INTO participants (booking_id, name, phone, address, birth_place, birth_date) VALUES ?";
            const participantValues = peserta.map(p => [
                bookingId,
                p.nama,
                p.telepon,
                p.alamat,
                p.tempatLahir,
                p.tanggalLahir
            ]);

            db.query(participantSql, [participantValues], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error menyimpan peserta:", err);
                        res.status(500).json({ success: false, message: "Gagal menyimpan data peserta." });
                    });
                }

                // 3. Jika semua berhasil, konfirmasi transaksi
                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Error saat commit:", err);
                            res.status(500).json({ success: false, message: "Kesalahan server." });
                        });
                    }
                    console.log("Pemesanan baru berhasil disimpan dengan ID:", bookingId);
                    res.status(201).json({ success: true, message: "Pemesanan berhasil dibuat!", bookingId: bookingId });
                });
            });
        });
    });
});

// === API CREATE BOOKING ===
app.post('/api/bookings', (req, res) => {
    const { namaPaket, emailKontak, totalHarga, status, peserta } = req.body;
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });
        const bookingSql = "INSERT INTO bookings (package_name, contact_email, total_price, status) VALUES (?, ?, ?, ?)";
        db.query(bookingSql, [namaPaket, emailKontak, totalHarga, status || 'Pending'], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Gagal menyimpan booking." }));
            const bookingId = result.insertId;
            if (!peserta || peserta.length === 0) {
                return db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Kesalahan server." }));
                    res.status(201).json({ success: true, message: "Pemesanan berhasil dibuat!", bookingId });
                });
            }
            const participantSql = "INSERT INTO participants (booking_id, name, phone, address, birth_place, birth_date) VALUES ?";
            const participantValues = peserta.map(p => [bookingId, p.nama, p.telepon, p.alamat, p.tempatLahir, p.tanggalLahir]);
            db.query(participantSql, [participantValues], (err, result) => {
                if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Gagal menyimpan peserta." }));
                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Kesalahan server." }));
                    res.status(201).json({ success: true, message: "Pemesanan berhasil dibuat!", bookingId });
                });
            });
        });
    });
});

// === API CREATE BOOKING ===
app.post('/api/bookings', (req, res) => {
    const { namaPaket, emailKontak, totalHarga, status, peserta } = req.body;
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });
        const bookingSql = "INSERT INTO bookings (package_name, contact_email, total_price, status) VALUES (?, ?, ?, ?)";
        db.query(bookingSql, [namaPaket, emailKontak, totalHarga, status || 'Pending'], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Gagal menyimpan booking." }));
            const bookingId = result.insertId;
            if (!peserta || peserta.length === 0) {
                return db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Kesalahan server." }));
                    res.status(201).json({ success: true, message: "Pemesanan berhasil dibuat!", bookingId });
                });
            }
            const participantSql = "INSERT INTO participants (booking_id, name, phone, address, birth_place, birth_date) VALUES ?";
            const participantValues = peserta.map(p => [bookingId, p.nama, p.telepon, p.alamat, p.tempatLahir, p.tanggalLahir]);
            db.query(participantSql, [participantValues], (err, result) => {
                if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Gagal menyimpan peserta." }));
                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Kesalahan server." }));
                    res.status(201).json({ success: true, message: "Pemesanan berhasil dibuat!", bookingId });
                });
            });
        });
    });
});







// === API READ ALL BOOKINGS (Laporan Keuangan) ===
app.get('/api/laporan-keuangan', (req, res) => {
    const sql = `
        SELECT 
            b.id,
            b.package_name as paketTour,
            b.contact_email as email,
            b.total_price as totalTagihan,
            b.status,
            b.created_at as tanggal,
            (SELECT p.name FROM participants p WHERE p.booking_id = b.id LIMIT 1) as namaPelanggan,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', p.id, 'name', p.name, 'phone', p.phone, 'address', p.address, 'birth_place', p.birth_place, 'birth_date', p.birth_date)) FROM participants p WHERE p.booking_id = b.id) as items
        FROM bookings b
        ORDER BY b.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error mengambil laporan:", err);
            return res.status(500).json({ success: false, message: "Kesalahan server." });
        }
        // Parse string JSON 'items' menjadi array objek
        const data = results.map(row => ({...row, items: JSON.parse(row.items) || [] }));
        res.status(200).json({ success: true, data: data });
    });
});

// === API UPDATE BOOKING ===
app.put('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const { paketTour, email, totalTagihan, status } = req.body; // Menggunakan nama yang konsisten
    const sql = "UPDATE bookings SET package_name = ?, contact_email = ?, total_price = ?, status = ? WHERE id = ?";
    const values = [paketTour, email, totalTagihan, status, bookingId];
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Gagal mengupdate booking." });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Booking tidak ditemukan." });
        res.status(200).json({ success: true, message: "Booking berhasil diupdate!" });
    });
});

// === API DELETE BOOKING ===
app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ success: false, message: "Kesalahan server." });
        const deleteParticipantsSql = "DELETE FROM participants WHERE booking_id = ?";
        db.query(deleteParticipantsSql, [bookingId], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Gagal menghapus peserta." }));
            const deleteBookingSql = "DELETE FROM bookings WHERE id = ?";
            db.query(deleteBookingSql, [bookingId], (err, result) => {
                if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Gagal menghapus booking." }));
                if (result.affectedRows === 0) return db.rollback(() => res.status(404).json({ success: false, message: "Booking tidak ditemukan." }));
                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json({ success: false, message: "Kesalahan server." }));
                    res.status(200).json({ success: true, message: "Booking berhasil dihapus!" });
                });
            });
        });
    });
});


app.listen(port, () => {
  console.log(`Server backend berjalan di http://localhost:${port}`);
});
