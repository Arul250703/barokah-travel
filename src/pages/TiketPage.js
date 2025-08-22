// src/pages/TiketPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Tiket from "./Tiket"; // Pastikan path ini benar
import "../components/styles/TiketPage.css";

const TiketPage = () => {
  // --- PERUBAHAN UTAMA: Mengambil data dari URL, bukan state ---
  const { bookingId } = useParams();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil detail booking dari backend
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/bookings/${bookingId}`
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Booking tidak ditemukan.");
        }
        const data = await response.json();
        setBookingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  // Tampilan saat data sedang dimuat
  if (loading) {
    return (
      <div className="tiket-page-container">
        <div className="tiket-page-content">
          <h1>Memuat data tiket...</h1>
        </div>
      </div>
    );
  }

  // Tampilan jika terjadi error
  if (error) {
    return (
      <div className="tiket-page-container">
        <div className="tiket-page-content">
          <h1>Oops! Terjadi Kesalahan</h1>
          <p>{error}</p>
          <Link to="/" className="back-to-home-link">
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  // Tampilan jika data tidak ditemukan
  if (!bookingData) {
    return (
      <div className="tiket-page-container">
        <div className="tiket-page-content">
          <h1>Data booking tidak ditemukan.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="tiket-page-container">
      <div className="tiket-page-content loaded">
        <h1 className="tiket-page-title">Pemesanan Berhasil!</h1>
        <p className="tiket-page-subtitle">
          Berikut adalah e-tiket untuk setiap peserta. Tunjukkan QR Code kepada
          petugas di lokasi.
        </p>

        <div className="booking-info">
          <span>
            ID Booking: <strong>{bookingData.booking_id}</strong>
          </span>
          <span>
            Paket: <strong>{bookingData.package_name}</strong>
          </span>
        </div>

        <div className="tiket-list">
          {bookingData.participants.map((participant) => (
            <div
              key={participant.participant_id}
              style={{ "--ticket-index": participant.participant_id }}
            >
              <Tiket
                participantId={participant.participant_id}
                bookingId={bookingData.booking_id}
                nama={participant.name}
                telepon={participant.phone}
                namaPaket={bookingData.package_name}
              />
            </div>
          ))}
        </div>

        <Link to="/" className="back-to-home-link">
          <span>Selesai & Kembali ke Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default TiketPage;
