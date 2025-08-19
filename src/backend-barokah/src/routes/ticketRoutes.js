const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");

// Route untuk mendapatkan semua data tiket (untuk dashboard admin)
router.get("/", ticketController.getAllTickets);

// Route untuk MEMBUAT booking baru dari Postman atau frontend
router.post("/", ticketController.createBooking);

// Route untuk memvalidasi tiket dari hasil scan QR
router.post("/validate", ticketController.validateTicket);

// Route (opsional) untuk mengubah status secara manual (reset/void)
router.put("/:id/status", ticketController.updateTicketStatus);

module.exports = router;
