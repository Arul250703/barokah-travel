// file: src/routes/packageRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // <-- Sesuaikan path import

// GET: Mengambil semua paket
router.get('/packages', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM packages ORDER BY id DESC");
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: "Error pada server", error: err.message });
    }
});

// GET: Mengambil satu paket berdasarkan ID
router.get('/packages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await db.query("SELECT * FROM packages WHERE id = ?", [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: "Paket tidak ditemukan" });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        res.status(500).json({ message: "Error pada server", error: err.message });
    }
});

// POST: Membuat paket baru
router.post('/packages', async (req, res) => {
    try {
        const { category_id, title, slug, price, min_pax, duration, description } = req.body;
        const query = "INSERT INTO packages (category_id, title, slug, price, min_pax, duration, description) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const [results] = await db.query(query, [category_id, title, slug, price, min_pax, duration, description]);
        res.status(201).json({ message: "Paket berhasil dibuat", id: results.insertId });
    } catch (err) {
        res.status(500).json({ message: "Error pada server", error: err.message });
    }
});

// PUT: Mengupdate paket berdasarkan ID
router.put('/packages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, title, slug, price, min_pax, duration, description } = req.body;
        const query = "UPDATE packages SET category_id = ?, title = ?, slug = ?, price = ?, min_pax = ?, duration = ? , description = ? WHERE id = ?";
        await db.query(query, [category_id, title, slug, price, min_pax, duration, description, id]);
        res.status(200).json({ message: "Paket berhasil diupdate" });
    } catch (err) {
        res.status(500).json({ message: "Error pada server", error: err.message });
    }
});

// DELETE: Menghapus paket berdasarkan ID
router.delete('/packages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM packages WHERE id = ?", [id]);
        res.status(200).json({ message: "Paket berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ message: "Error pada server", error: err.message });
    }
});

module.exports = router;