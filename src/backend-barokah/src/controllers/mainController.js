// const db = require("../config/db");
// const { v4: uuidv4 } = require("uuid");

// // Fungsi Login
// const loginUser = (req, res) => {
//   const { username, password } = req.body;
//   const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
//   db.query(sql, [username, password], (err, results) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ success: false, message: "Terjadi kesalahan pada server." });
//     if (results.length > 0) {
//       res.status(200).json({ success: true, message: "Login berhasil!" });
//     } else {
//       res
//         .status(401)
//         .json({ success: false, message: "Username atau password salah." });
//     }
//   });
// };

// // Fungsi Membuat Booking
// const createBooking = (req, res) => {
//   console.log("1. Menerima permintaan di /api/bookings...");
//   const {
//     package_id,
//     customer_name,
//     customer_email,
//     total_price,
//     participants,
//   } = req.body;

//   if (
//     !package_id ||
//     !customer_name ||
//     !participants ||
//     !Array.isArray(participants) ||
//     participants.length === 0 ||
//     total_price === undefined
//   ) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Data yang dikirim tidak lengkap." });
//   }

//   console.log("2. Meminjam koneksi dari pool...");
//   db.getConnection((err, connection) => {
//     if (err) {
//       console.error("GAGAL di langkah 2:", err);
//       return res.status(500).json({
//         success: false,
//         message: "Kesalahan server saat koneksi database.",
//       });
//     }
//     console.log("3. Koneksi didapat, memulai transaksi...");

//     connection.beginTransaction((err) => {
//       if (err) {
//         console.error("GAGAL di langkah 3:", err);
//         connection.release();
//         return res
//           .status(500)
//           .json({ success: false, message: "Gagal memulai transaksi." });
//       }

//       console.log(
//         "4. Menjalankan query untuk mendapatkan kode paket & kota..."
//       );
//       const getCodesQuery =
//         "SELECT p.trip_code, c.city_code FROM packages p JOIN cities c ON p.city_id = c.id WHERE p.id = ?";

//       connection.query(getCodesQuery, [package_id], (err, results) => {
//         if (err || results.length === 0) {
//           return connection.rollback(() => {
//             console.error(
//               "GAGAL di langkah 4:",
//               err || "Paket tidak ditemukan"
//             );
//             connection.release();
//             res
//               .status(500)
//               .json({ success: false, message: "Paket tidak ditemukan." });
//           });
//         }
//         console.log("5. Kode didapat, menjalankan INSERT booking...");

//         const { city_code, trip_code } = results[0];
//         const unique_id = uuidv4().split("-")[0].toUpperCase();
//         const newBookingId = `${city_code}-${trip_code}-${unique_id}`;

//         const bookingSql = `INSERT INTO bookings (booking_id, package_id, customer_name, customer_email, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, 'selesai', NOW())`;
//         const bookingValues = [
//           newBookingId,
//           package_id,
//           customer_name,
//           customer_email,
//           total_price,
//         ];

//         connection.query(bookingSql, bookingValues, (err, result) => {
//           if (err) {
//             return connection.rollback(() => {
//               console.error("GAGAL di langkah 5:", err);
//               connection.release();
//               res.status(500).json({
//                 success: false,
//                 message: "Gagal menyimpan data pemesanan.",
//               });
//             });
//           }
//           console.log("6. Booking tersimpan, menjalankan INSERT peserta...");

//           const newBookingPrimaryKey = result.insertId;
//           const participantSql = `INSERT INTO participants (booking_id, name, phone, address, birth_place, birth_date, status) VALUES ?`;
//           const participantValues = participants.map((p) => [
//             newBookingPrimaryKey,
//             p.name,
//             p.phone,
//             p.address,
//             p.birth_place,
//             p.birth_date || null,
//             "valid",
//           ]);

//           connection.query(
//             participantSql,
//             [participantValues],
//             (err, result) => {
//               if (err) {
//                 return connection.rollback(() => {
//                   console.error("GAGAL di langkah 6:", err);
//                   connection.release();
//                   res.status(500).json({
//                     success: false,
//                     message: "Gagal menyimpan data peserta.",
//                   });
//                 });
//               }
//               console.log("7. Peserta tersimpan, menjalankan COMMIT...");

//               connection.commit((err) => {
//                 if (err) {
//                   return connection.rollback(() => {
//                     console.error("GAGAL di langkah 7:", err);
//                     connection.release();
//                     res.status(500).json({
//                       success: false,
//                       message: "Kesalahan server saat commit.",
//                     });
//                   });
//                 }
//                 console.log("8. COMMIT berhasil, mengirim respons.");
//                 connection.release();
//                 res.status(201).json({
//                   success: true,
//                   message: "Pemesanan berhasil dibuat!",
//                   bookingId: newBookingId,
//                 });
//               });
//             }
//           );
//         });
//       });
//     });
//   });
// };

// // Fungsi untuk mendapatkan semua booking
// const getAllBookings = (req, res) => {
//   const sql = `
//     SELECT 
//       b.id, 
//       b.booking_id, 
//       b.customer_name, 
//       b.customer_email, 
//       b.total_price,
//       b.status,
//       b.created_at,
//       p.name AS package_name
//     FROM bookings AS b
//     LEFT JOIN packages AS p ON b.package_id = p.id
//     ORDER BY b.created_at DESC
//   `;
  
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error("Error fetching bookings:", err);
//       return res.status(500).json({ 
//         success: false, 
//         message: "Gagal mengambil data booking." 
//       });
//     }
//     res.status(200).json({ success: true, data: results });
//   });
// };

// // Fungsi untuk mendapatkan detail booking berdasarkan ID
// const getBookingById = (req, res) => {
//   const { bookingId } = req.params;

//   const query = `
//     SELECT 
//       b.id, 
//       b.booking_id, 
//       b.customer_name, 
//       b.customer_email, 
//       b.status AS payment_status, 
//       p.name AS package_name
//     FROM bookings AS b
//     LEFT JOIN packages AS p ON b.package_id = p.id
//     WHERE b.booking_id = ?
//   `;
//   db.query(query, [bookingId], (err, results) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ success: false, message: "Kesalahan server." });
//     }
//     if (results.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Booking tidak ditemukan." });
//     }

//     const booking = results[0];
//     const participantsQuery =
//       "SELECT id AS participant_id, name, phone, status AS ticket_status FROM participants WHERE booking_id = ?";

//     db.query(participantsQuery, [booking.id], (err, participants) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ success: false, message: "Gagal mengambil data peserta." });
//       }
//       booking.participants = participants;
//       res.status(200).json(booking);
//     });
//   });
// };

// // Fungsi untuk validasi scanner
// const validateParticipant = (req, res) => {
//   const { participantId } = req.body;
//   if (!participantId)
//     return res
//       .status(400)
//       .json({ success: false, message: "ID Peserta tidak boleh kosong." });

//   const findSql = "SELECT * FROM participants WHERE id = ?";
//   db.query(findSql, [participantId], (err, results) => {
//     if (err)
//       return res
//         .status(500)
//         .json({ success: false, message: "Kesalahan server." });

//     const participant = results[0];
//     if (!participant)
//       return res
//         .status(404)
//         .json({ success: false, message: "TIKET TIDAK DITEMUKAN" });

//     if (participant.status === "sudah_digunakan")
//       return res.status(409).json({
//         success: false,
//         message: "TIKET SUDAH DIGUNAKAN",
//         name: participant.name,
//       });
//     if (participant.status === "hangus")
//       return res.status(410).json({
//         success: false,
//         message: "TIKET HANGUS/BATAL",
//         name: participant.name,
//       });

//     if (participant.status === "valid") {
//       const updateSql =
//         "UPDATE participants SET status = 'sudah_digunakan', scanned_at = NOW() WHERE id = ?";
//       db.query(updateSql, [participantId], (err, result) => {
//         if (err)
//           return res
//             .status(500)
//             .json({ success: false, message: "Gagal update status tiket." });
//         res.status(200).json({
//           success: true,
//           message: "VALIDASI BERHASIL",
//           name: participant.name,
//         });
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: "Status tiket tidak valid untuk check-in.",
//       });
//     }
//   });
// };

// // Fungsi untuk konfirmasi pembayaran
// const confirmPayment = (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   const allowedStatus = ['dp_lunas', 'selesai', 'dibatalkan'];
//   if (!status || !allowedStatus.includes(status)) {
//     return res.status(400).json({ 
//       success: false, 
//       message: "Nilai status tidak valid." 
//     });
//   }

//   const sql = "UPDATE bookings SET status = ? WHERE id = ?";
//   db.query(sql, [status, id], (err, result) => {
//     if (err) {
//       console.error("Error updating payment status:", err);
//       return res.status(500).json({ 
//         success: false, 
//         message: "Gagal memperbarui status pembayaran." 
//       });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Booking dengan ID tersebut tidak ditemukan." 
//       });
//     }
//     res.status(200).json({ 
//       success: true, 
//       message: `Status booking berhasil diubah menjadi '${status}'` 
//     });
//   });
// };

// // Fungsi untuk update status pembayaran (alias untuk confirmPayment)
// const updatePaymentStatus = confirmPayment;

// // Ekspor semua fungsi
// module.exports = {
//   loginUser,
//   createBooking,
//   getAllBookings,
//   getBookingById,
//   validateParticipant,
//   confirmPayment,
//   updatePaymentStatus
// };