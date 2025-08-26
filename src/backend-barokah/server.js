import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

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
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "barokahtour_db",
});

// Cek koneksi
db.connect((err) => {
  if (err) {
    console.error("Database gagal terkoneksi:", err);
  } else {
    console.log("Database terkoneksi");
  }
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
    // Jika ada file upload
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
    // Jika tidak ada file upload
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

// ================== API UNTUK STATISTIK ==================

// Statistik peserta
app.get("/api/stats/peserta", (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];
  
  // Hitung awal minggu (Minggu)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfWeekFormatted = startOfWeek.toISOString().split('T')[0];
  
  // Hitung awal bulan
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
  
  // Hitung awal minggu (Minggu)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfWeekFormatted = startOfWeek.toISOString().split('T')[0];
  
  // Hitung awal bulan
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

// ================== API UNTUK BUKU TAMU ==================

// Simpan data peserta
app.post("/api/peserta", (req, res) => {
  const { nama, alamat, tempat_lahir, tanggal_lahir, telepon, tujuan } = req.body;
  const tanggal = new Date().toISOString().split('T')[0]; // Tanggal hari ini
  
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
  
  const tanggal = new Date().toISOString().split('T')[0]; // Tanggal hari ini
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

// Ambil data peserta dengan pagination untuk buku tamu
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

// Ambil data marketing dengan pagination untuk buku tamu
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

// ================== SERVER JALAN ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});