const pool = require("../config/db"); // Import koneksi database

// Fungsi untuk mendapatkan semua tiket untuk dashboard admin
const getAllTickets = async (req, res) => {
  try {
    // Query untuk mengambil data gabungan dari bookings dan packages
    const query = `
      SELECT 
        b.booking_id AS id,
        b.customer_name AS namaPelanggan,
        b.customer_email AS email,
        p.name AS paket,
        b.status,
        b.booking_date AS tanggal
      FROM bookings b
      JOIN packages p ON b.package_id = p.package_id
      ORDER BY b.booking_date DESC
    `;
    const [tickets] = await pool.query(query);

    // Untuk setiap tiket, kita perlu mengambil data pesertanya
    for (const ticket of tickets) {
      const [peserta] = await pool.query(
        "SELECT name, phone FROM participants WHERE booking_id = ?",
        [ticket.id]
      );
      // Ubah format nama field agar sesuai dengan frontend ('telepon')
      ticket.peserta = peserta.map((p) => ({ nama: p.name, telepon: p.phone }));
    }

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data tiket dari server." });
  }
};

// Fungsi untuk memvalidasi tiket dari hasil scan QR
const validateTicket = async (req, res) => {
  const { ticketId } = req.body;

  if (!ticketId) {
    return res.status(400).json({ message: "ID Tiket tidak boleh kosong." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM bookings WHERE booking_id = ?",
      [ticketId]
    );
    const ticket = rows[0];

    if (!ticket) {
      return res.status(404).json({
        message: "TIKET TIDAK DITEMUKAN",
        name: `ID Tiket: ${ticketId}`,
      });
    }

    if (ticket.status === "sudah_digunakan") {
      return res.status(409).json({
        message: "TIKET SUDAH DIGUNAKAN",
        name: `Atas nama: ${ticket.customer_name}`,
      });
    }

    if (ticket.status === "hangus") {
      return res.status(410).json({
        message: "TIKET HANGUS/BATAL",
        name: `Atas nama: ${ticket.customer_name}`,
      });
    }

    if (ticket.status === "valid") {
      // Update status tiket di database
      await pool.query(
        "UPDATE bookings SET status = 'sudah_digunakan', scanned_at = NOW() WHERE booking_id = ?",
        [ticketId]
      );
      return res.status(200).json({
        message: "VALIDASI BERHASIL",
        name: `Atas nama: ${ticket.customer_name}`,
      });
    }

    // Fallback untuk status yang tidak terduga
    res
      .status(400)
      .json({ message: "Status tiket tidak valid untuk check-in." });
  } catch (error) {
    console.error("Error validating ticket:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Fungsi (opsional) untuk update manual
const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // status bisa 'valid' atau 'hangus'

  if (!["valid", "hangus"].includes(status)) {
    return res.status(400).json({ message: "Status tidak valid." });
  }

  try {
    await pool.query("UPDATE bookings SET status = ? WHERE booking_id = ?", [
      status,
      id,
    ]);
    res.status(200).json({
      message: `Status tiket ${id} berhasil diubah menjadi ${status}`,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Gagal mengubah status tiket." });
  }
};

// --- FUNGSI YANG HILANG DITAMBAHKAN DI SINI ---
const createBooking = async (req, res) => {
  const {
    booking_id,
    package_id,
    customer_name,
    customer_email,
    participants,
  } = req.body;

  if (
    !booking_id ||
    !package_id ||
    !customer_name ||
    !participants ||
    !participants.length
  ) {
    return res
      .status(400)
      .json({ message: "Data yang dikirim tidak lengkap." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const bookingQuery = `
      INSERT INTO bookings (booking_id, package_id, customer_name, customer_email, status)
      VALUES (?, ?, ?, ?, 'valid')
    `;
    await connection.query(bookingQuery, [
      booking_id,
      package_id,
      customer_name,
      customer_email,
    ]);

    const participantQuery = `
      INSERT INTO participants (booking_id, name, phone) VALUES (?, ?, ?)
    `;
    for (const participant of participants) {
      await connection.query(participantQuery, [
        booking_id,
        participant.name,
        participant.phone,
      ]);
    }

    await connection.commit();

    res.status(201).json({
      message: "Booking berhasil dibuat!",
      bookingId: booking_id,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating booking:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: `Gagal: Booking ID '${booking_id}' sudah ada.` });
    }
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  } finally {
    connection.release();
  }
};

// --- BAGIAN EKSPOR DIPERBARUI DI SINI ---
module.exports = {
  getAllTickets,
  validateTicket,
  updateTicketStatus,
  createBooking, // <-- Pastikan ini ditambahkan
};
