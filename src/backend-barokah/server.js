import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // untuk akses foto

// === MySQL Connection ===
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "barokah_tour",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// === Multer Config untuk Upload Foto ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ========== API PESERTA ==========
app.get("/api/admin/peserta", (req, res) => {
  db.query("SELECT * FROM peserta ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/admin/peserta", upload.single("foto"), (req, res) => {
  const { nama, alamat } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    "INSERT INTO peserta (nama, alamat, foto) VALUES (?, ?, ?)",
    [nama, alamat, foto],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Peserta berhasil ditambahkan", id: result.insertId });
    }
  );
});

// ========== API MARKETING ==========
app.get("/api/admin/marketing", (req, res) => {
  db.query(
    "SELECT * FROM marketing ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.post("/api/admin/marketing", upload.single("foto"), (req, res) => {
  const { nama, kontak } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    "INSERT INTO marketing (nama, kontak, foto) VALUES (?, ?, ?)",
    [nama, kontak, foto],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        message: "Marketing berhasil ditambahkan",
        id: result.insertId,
      });
    }
  );
});

// ========== API KUNJUNGAN ==========
app.get("/api/admin/kunjungan", (req, res) => {
  db.query(
    "SELECT * FROM kunjungan ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

app.post("/api/admin/kunjungan", upload.single("foto"), (req, res) => {
  const { nama_peserta, tujuan } = req.body;
  const foto = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    "INSERT INTO kunjungan (nama_peserta, tujuan, foto) VALUES (?, ?, ?)",
    [nama_peserta, tujuan, foto],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        message: "Kunjungan berhasil ditambahkan",
        id: result.insertId,
      });
    }
  );
});

// ========== RUN SERVER ==========
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
