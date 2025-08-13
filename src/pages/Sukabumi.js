// src/pages/Sukabumi.js

import React from "react";
import { Link } from "react-router-dom"; // Pastikan Link di-import
import "../components/styles/Sukabumi.css";

// Import aset gambar
import situ from "../assets/images/situ.jpeg";
import plara from "../assets/images/plara.jpeg";
import servicesBg from "../assets/images/services-bg.jpg";
import videoSection from "../assets/videos/video-section.mp4";

const Sukabumi = () => {
  // Data paket untuk dikirim ke halaman pembayaran
  const paketData = {
    namaPaket: "Situ Gunung-Heritage Kota Sukabumi 2H1M",
    harga: 695000, // Gunakan format angka agar mudah dikalkulasi
  };

  return (
    <div className="detail-page-container">
      <header className="detail-hero-section">
        <img src={servicesBg} alt="Background" className="detail-hero-bg" />
        <div className="detail-hero-overlay">
          <h1 className="detail-hero-title">Paket Wisata Sukabumi</h1>
          <p className="detail-hero-subtitle">
            Jelajahi keindahan alam Sukabumi bersama kami!
          </p>
        </div>
      </header>

      <section className="detail-content-section">
        <div className="detail-container">
          <h2 className="detail-section-title">{paketData.namaPaket}</h2>
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <p>
                <strong>Harga:</strong> IDR 695.000
              </p>
              <p>
                <strong>Durasi:</strong> 2 Hari 1 Malam
              </p>
              <p>
                <strong>Lokasi:</strong> Sukabumi, Jawa Barat
              </p>
            </div>
            <div className="detail-info-item">
              <p>
                <strong>Deskripsi Paket:</strong>
              </p>
              <p>
                Nikmati pesona alam Situ Gunung dan sejarah kota Sukabumi. Paket
                ini cocok untuk liburan singkat yang menyegarkan.
              </p>
              <p>
                <strong>Fasilitas:</strong>
              </p>
              <ul>
                <li>Transportasi AC</li>
                <li>Akomodasi Hotel</li>
                <li>Makan sesuai jadwal</li>
                <li>Tiket masuk wisata</li>
                <li>Pemandu wisata profesional</li>
              </ul>
            </div>
          </div>
          <div className="detail-gallery">
            <img src={situ} alt="Situ Gunung" />
            <img src={plara} alt="Pelabuhan Ratu" />
          </div>

          {/* UBAH BAGIAN INI: dari <a> menjadi <Link> */}
          <Link
            to="/pembayaran"
            state={paketData} // Kirim data paket melalui state
            className="detail-cta-button"
          >
            Pesan Paket Ini Sekarang!
          </Link>
        </div>
      </section>

      <section className="custom-cta">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="cta-video"
          src={videoSection}
        />
        <div className="cta-overlay">
          <div className="cta-text">
            <h2>Belum menemukan paket yang sesuai?</h2>
            <p>
              Kami siap bantu merancang perjalanan khusus sesuai kebutuhan dan
              anggaran Anda!
            </p>
            <a
              href="https://wa.me/6285930005544"
              className="cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat Kami Sekarang
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sukabumi;
