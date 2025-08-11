// src/pages/DetailPembayaran.js

import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
// PERBAIKAN: Impor QRCodeSVG secara spesifik, bukan sebagai default
import { QRCodeSVG } from "qrcode.react";
import "../components/styles/DetailPembayaran.css";; // Pastikan path CSS benar

const DetailPembayaran = () => {
  const location = useLocation();
  const { namaPaket, harga } = location.state || {
    namaPaket: "Paket tidak ditemukan",
    harga: 0,
  };

  // State untuk menyimpan data setiap peserta dalam bentuk array of objects
  const [peserta, setPeserta] = useState([
    { id: 1, nama: "", telepon: "" }, // Peserta pertama (kepala keluarga)
  ]);
  const [emailKontak, setEmailKontak] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // State untuk menampilkan QR code

  // Fungsi untuk menangani perubahan pada input form peserta
  const handlePesertaChange = (index, event) => {
    const values = [...peserta];
    values[index][event.target.name] = event.target.value;
    setPeserta(values);
  };

  // Fungsi untuk menambah peserta baru
  const tambahPeserta = () => {
    setPeserta([...peserta, { id: peserta.length + 1, nama: "", telepon: "" }]);
  };

  // Fungsi untuk menghapus peserta
  const hapusPeserta = (index) => {
    if (peserta.length > 1) {
      // Pastikan minimal ada 1 peserta
      const values = [...peserta];
      values.splice(index, 1);
      setPeserta(values);
    }
  };

  // Kalkulasi total harga
  const totalHarga = harga * peserta.length;

  // Fungsi untuk format mata uang Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Fungsi yang dijalankan saat form disubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi sederhana
    if (
      peserta.some((p) => p.nama === "" || p.telepon === "") ||
      emailKontak === ""
    ) {
      alert("Harap lengkapi semua data peserta dan email kontak.");
      return;
    }
    setIsSubmitted(true); // Tampilkan halaman QR Code
  };

  // Render halaman QR Code jika sudah submit
  if (isSubmitted) {
    return (
      <div className="payment-page">
        <div className="qr-container">
          <h1 className="qr-title">Pemesanan Berhasil!</h1>
          <p className="qr-subtitle">
            Silakan tunjukkan QR Code berikut kepada petugas.
          </p>
          <div className="qr-grid">
            {peserta.map((p, index) => (
              <div key={index} className="qr-card">
                {/* PERBAIKAN: Gunakan komponen QRCodeSVG */}
                <QRCodeSVG
                  value={`Peserta: ${p.nama}, Paket: ${namaPaket}, Telepon: ${p.telepon}`}
                  size={128}
                />
                <p className="qr-name">{p.nama}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="back-to-form-btn"
          >
            Kembali ke Form
          </button>
        </div>
      </div>
    );
  }

  // Render form pembayaran jika belum submit
  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1 className="payment-title">Detail Pemesanan</h1>
        <p className="payment-subtitle">
          Paket Wisata: <strong>{namaPaket}</strong>
        </p>

        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emailKontak">Email Kontak (Untuk E-Ticket)</label>
            <input
              type="email"
              id="emailKontak"
              value={emailKontak}
              onChange={(e) => setEmailKontak(e.target.value)}
              required
            />
          </div>

          <hr className="divider" />

          <h3 className="peserta-title">Data Peserta</h3>

          {peserta.map((data, index) => (
            <div key={index} className="peserta-card">
              <div className="peserta-header">
                <h4>Peserta {index + 1}</h4>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => hapusPeserta(index)}
                    className="remove-btn"
                  >
                    Hapus
                  </button>
                )}
              </div>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  name="nama"
                  value={data.nama}
                  onChange={(e) => handlePesertaChange(index, e)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nomor Telepon</label>
                <input
                  type="tel"
                  name="telepon"
                  value={data.telepon}
                  onChange={(e) => handlePesertaChange(index, e)}
                  required
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={tambahPeserta} className="add-btn">
            + Tambah Peserta
          </button>

          <div className="summary-section">
            <p className="price-per-person">
              Harga per orang: <strong>{formatRupiah(harga)}</strong>
            </p>
            <p className="price-per-person">
              Jumlah Peserta: <strong>{peserta.length}</strong>
            </p>
            <hr className="divider" />
            <h2 className="total-price">
              Total Pembayaran: <span>{formatRupiah(totalHarga)}</span>
            </h2>
          </div>

          <button type="submit" className="submit-btn">
            Buat QR Code Pembayaran
          </button>

          <Link to="/sukabumi" className="back-link">
            Kembali ke Detail Paket
          </Link>
        </form>
      </div>
    </div>
  );
};

export default DetailPembayaran;
