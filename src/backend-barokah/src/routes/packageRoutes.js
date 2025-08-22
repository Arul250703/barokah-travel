const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");

// Rute untuk mendapatkan semua paket
router.get("/", packageController.getAllPackages);

module.exports = router;
