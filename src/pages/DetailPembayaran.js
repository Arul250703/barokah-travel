// src/pages/DetailPembayaran.js
import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../components/styles/DetailPembayaran.css";

const DetailPembayaran = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { namaPaket, harga } = location.state || {
    namaPaket: "Paket tidak ditemukan",
    harga: 0,
  };

  const [peserta, setPeserta] = useState([{ id: 1, nama: "", telepon: "" }]);
  const [emailKontak, setEmailKontak] = useState("");

  const handlePesertaChange = (index, event) => {
    const values = [...peserta];
    values[index][event.target.name] = event.target.value;
    setPeserta(values);
  };

  const tambahPeserta = () => {
    setPeserta([...peserta, { id: peserta.length + 1, nama: "", telepon: "" }]);
  };

  const hapusPeserta = (index) => {
    if (peserta.length > 1) {
      const values = [...peserta];
      values.splice(index, 1);
      setPeserta(values);
    }
  };

  const totalHarga = harga * peserta.length;

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      peserta.some((p) => p.nama === "" || p.telepon === "") ||
      emailKontak === ""
    ) {
      alert("Harap lengkapi semua data peserta dan email kontak.");
      return;
    }

    // Navigasi ke halaman Invoice dengan membawa data
    navigate("/invoice", {
      state: {
        namaPaket,
        harga,
        peserta,
        emailKontak,
        totalHarga,
      },
    });
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1 className="payment-title">Detail Pemesanan</h1>
        <p className="payment-subtitle">
          Paket Wisata: <strong>{namaPaket}</strong>
        </p>

        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Kontak (Untuk E-Ticket)</label>
            <input
              type="email"
              value={emailKontak}
              onChange={(e) => setEmailKontak(e.target.value)}
              required
            />
          </div>

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
            <p>Harga per orang: <strong>{formatRupiah(harga)}</strong></p>
            <p>Jumlah Peserta: <strong>{peserta.length}</strong></p>
            <h2>Total Pembayaran: <span>{formatRupiah(totalHarga)}</span></h2>
          </div>

          <button type="submit" className="submit-btn">
            Payment Sekarang
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
