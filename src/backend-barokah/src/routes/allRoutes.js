const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController");

// Rute Login
router.post("/login", controller.loginUser);

// Rute Booking
router.post("/bookings", controller.createBooking);
// ... tambahkan rute GET, PUT, DELETE untuk bookings di sini ...

// Rute Validasi Scanner
router.post("/scan/validate", controller.validateParticipant);

// Tambahkan rute ini di file allRoutes.js Anda
router.get('/bookings/:bookingId', controller.getBookingById);

// Rute Laporan
// router.get('/laporan-keuangan', controller.getLaporanKeuangan);

module.exports = router;
