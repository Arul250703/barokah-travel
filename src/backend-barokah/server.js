// file: server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // <-- Tambahkan ini

// Import routes
const ticketRoutes = require("./src/routes/ticketRoutes"); // <-- Tambahkan ini

dotenv.config();
const app = express();

// Middleware
app.use(cors()); // <-- Tambahkan ini agar frontend bisa akses
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("🎉 Server backend Barokah Tour berhasil berjalan!");
});

// Gunakan routes
app.use("/api/tickets", ticketRoutes); // <-- Tambahkan ini

app.listen(PORT, () => {
  console.log(`🖥️ Server berjalan di http://localhost:${PORT}`);
});
