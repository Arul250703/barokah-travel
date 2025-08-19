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

  const [peserta, setPeserta] = useState([
    { 
      id: 1, 
      nama: "", 
      telepon: "", 
      alamat: "",
      tempatLahir: "",
      tanggalLahir: ""
    }
  ]);
  const [emailKontak, setEmailKontak] = useState("");

  const handlePesertaChange = (index, event) => {
    const values = [...peserta];
    values[index][event.target.name] = event.target.value;
    setPeserta(values);
  };

  const tambahPeserta = () => {
    setPeserta([
      ...peserta, 
      { 
        id: peserta.length + 1, 
        nama: "", 
        telepon: "", 
        alamat: "",
        tempatLahir: "",
        tanggalLahir: ""
      }
    ]);
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

  // === FUNGSI INI YANG DIPERBAIKI ===
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isDataLengkap = peserta.every(p => 
      p.nama && p.telepon && p.alamat && p.tempatLahir && p.tanggalLahir
    );

    if (!isDataLengkap || !emailKontak) {
      alert("Harap lengkapi semua data peserta dan email kontak.");
      return;
    }


    // Siapkan SEMUA data yang akan dikirim
    const paymentData = {
      // Data dari halaman ini
      namaPaket,
      harga,
      peserta,
      emailKontak,
      totalHarga,
      // Data untuk VA
      methodName: "BCA Virtual Account", // Asumsi default
      vaNumber: '8808 ' + Math.floor(1000000000 + Math.random() * 9000000000),
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // Kirim sebagai objek Date
    };

    // Navigasi ke halaman Virtual Account dengan membawa SEMUA data
    navigate("/virtual-account", { state: paymentData });
    // Navigasi ke halaman Invoice dengan membawa data
    navigate("/invoice  ", {
      state: {
        namaPaket,
        harga,
        peserta,
        emailKontak,
        totalHarga,
      },
    });
<<<<<<< HEAD

=======
>>>>>>> a19dc494d94e797ab7ef71d9ef9a97bebaed6723
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1 className="payment-title">Detail Pemesanan</h1>
          <div className="package-info">
            <h2 className="package-name">{namaPaket}</h2>
            <p className="package-price">{formatRupiah(harga)} / orang</p>
          </div>
        </div>

        <form className="payment-form" onSubmit={handleSubmit}>
          {/* ... sisa form tidak berubah ... */}
          <div className="contact-section">
            <h3 className="section-title">
              <span className="section-icon">📧</span>
              Informasi Kontak
            </h3>
            <div className="form-group">
              <label>Email Kontak untuk E-Ticket</label>
              <input
                type="email"
                value={emailKontak}
                onChange={(e) => setEmailKontak(e.target.value)}
                placeholder="contoh@email.com"
                required
              />
            </div>
          </div>

          <div className="participants-section">
            <h3 className="section-title">
              <span className="section-icon">👥</span>
              Data Peserta
            </h3>
            
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
                      <span>×</span> Hapus
                    </button>
                  )}
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nama Lengkap *</label>
                    <input type="text" name="nama" value={data.nama} onChange={(e) => handlePesertaChange(index, e)} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Nomor Telepon *</label>
                    <input type="tel" name="telepon" value={data.telepon} onChange={(e) => handlePesertaChange(index, e)} required />
                  </div>

                  <div className="form-group full-width">
                    <label>Alamat Lengkap *</label>
                    <textarea name="alamat" value={data.alamat} onChange={(e) => handlePesertaChange(index, e)} rows="3" required />
                  </div>

                  <div className="form-group">
                    <label>Tempat Lahir *</label>
                    <input type="text" name="tempatLahir" value={data.tempatLahir} onChange={(e) => handlePesertaChange(index, e)} required />
                  </div>

                  <div className="form-group">
                    <label>Tanggal Lahir *</label>
                    <input type="date" name="tanggalLahir" value={data.tanggalLahir} onChange={(e) => handlePesertaChange(index, e)} required />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={tambahPeserta} className="add-btn">
              <span className="add-icon">+</span>
              Tambah Peserta
            </button>
          </div>

          <div className="summary-section">
            <h3 className="section-title">
              <span className="section-icon">💰</span>
              Ringkasan Pembayaran
            </h3>
            <div className="summary-content">
              <div className="summary-row">
                <span>Harga per orang</span>
                <span>{formatRupiah(harga)}</span>
              </div>
              <div className="summary-row">
                <span>Jumlah Peserta</span>
                <span>{peserta.length} orang</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(totalHarga)}</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button type="submit" className="submit-btn">
              <span>🚀</span>
              Lanjut ke Pembayaran
            </button>
            
            <Link to="/sukabumi" className="back-link">
              <span>←</span> Kembali ke Detail Paket
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailPembayaran;
