import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Tiket from "../pages/Tiket.js";
import "../components/styles/TiketPage.css"; // Pastikan path CSS ini benar

const TiketPage = () => {
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);

  // Add loading effect for smoother animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if state and peserta exist
  if (!location.state || !location.state.peserta) {
    return (
      <div className="tiket-page-container">
        <div className={`tiket-page-content ${isLoaded ? "loaded" : ""}`}>
          <h1 className="tiket-page-title">Oops! Data Tiket Tidak Ditemukan</h1>
          <p className="tiket-page-subtitle">
            Alur data terputus. Silakan mulai kembali dari halaman pemesanan.
          </p>
          <Link to="/" className="back-to-home-link">
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  // Extract data from state
  const { peserta, namaPaket, emailKontak } = location.state;

  return (
    <div className="tiket-page-container">
      <div className={`tiket-page-content ${isLoaded ? "loaded" : ""}`}>
        <h1 className="tiket-page-title">Pemesanan Berhasil!</h1>
        <p className="tiket-page-subtitle">
          E-Ticket telah dikirim ke email <strong>{emailKontak}</strong>.
        </p>

        {/* Ticket List with staggered animation */}
        <div className="tiket-list">
          {peserta.map((p, index) => (
            <div
              key={index}
              style={{
                "--ticket-index": index,
                animationDelay: `${0.8 + index * 0.1}s`,
              }}
            >
              <Tiket nama={p.nama} telepon={p.telepon} namaPaket={namaPaket} />
            </div>
          ))}
        </div>

        <Link to="/" className="back-to-home-link">
          <span>Selesai & Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
};

export default TiketPage;
