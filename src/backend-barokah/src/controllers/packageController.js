const pool = require("../config/db");

// Fungsi untuk mendapatkan semua paket wisata
exports.getAllPackages = async (req, res) => {
  try {
    const [packages] = await pool.query(
      "SELECT id, package_name, description, price FROM packages ORDER BY id"
    );
    res.status(200).json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ message: "Gagal mengambil data paket." });
  }
};
