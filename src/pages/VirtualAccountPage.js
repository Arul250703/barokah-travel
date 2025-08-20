import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/styles/VirtualAccountPage.css';

const VirtualAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentType, setPaymentType] = useState('full');
  const [activeTab, setActiveTab] = useState('atm');

  // Mengambil data dari halaman sebelumnya
  const paymentData = location.state || {
    methodName: "BCA Virtual Account",
    vaNumber: "8808123456789",
    amount: "Rp 0",
    expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam dari sekarang
    namaPaket: "Paket tidak tersedia",
    harga: 0,
    peserta: [],
    emailKontak: "",
    totalHarga: 0
  };

  // Pastikan semua data yang diperlukan tersedia
  const {
    namaPaket = "Paket tidak tersedia",
    harga = 0,
    peserta = [],
    emailKontak = "",
    totalHarga = 0
  } = paymentData;

  // Menghitung total dan DP
  const totalPeserta = peserta.length || 1;
  const hargaPerOrang = harga || 0;
  const calculatedTotalHarga = totalHarga || (hargaPerOrang * totalPeserta);
  const dpAmount = Math.floor(calculatedTotalHarga * 0.3);
  const sisaAmount = calculatedTotalHarga - dpAmount;

  // Format Rupiah
  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  // Countdown timer
  useEffect(() => {
    const expiryDate = paymentData.expiry instanceof Date 
      ? paymentData.expiry 
      : new Date(paymentData.expiry);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = expiryDate.getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData.expiry]);

  // Copy Virtual Account Number
  const copyVANumber = () => {
    navigator.clipboard.writeText(paymentData.vaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get bank instructions
  const getBankInstructions = () => {
    const bankId = (paymentData.methodName || '').toLowerCase();
    
    if (bankId.includes('bca')) {
      return {
        atm: [
          "Masukkan kartu ATM BCA dan PIN",
          "Pilih menu 'Transaksi Lain'",
          "Pilih 'Transfer'",
          "Pilih 'Ke Rek BCA Virtual Account'",
          "Masukkan nomor Virtual Account",
          "Masukkan nominal transfer",
          "Ikuti instruksi selanjutnya"
        ],
        mobile: [
          "Login ke aplikasi BCA mobile",
          "Pilih menu 'Transfer'",
          "Pilih 'BCA Virtual Account'",
          "Masukkan nomor Virtual Account",
          "Masukkan nominal transfer",
          "Konfirmasi pembayaran"
        ]
      };
    } else if (bankId.includes('mandiri')) {
      return {
        atm: [
          "Masukkan kartu ATM Mandiri dan PIN",
          "Pilih menu 'Bayar/Beli'",
          "Pilih 'Multi Payment'",
          "Masukkan kode perusahaan 88908",
          "Masukkan nomor Virtual Account",
          "Konfirmasi pembayaran"
        ],
        mobile: [
          "Login ke aplikasi Livin' by Mandiri",
          "Pilih menu 'Bayar'",
          "Pilih 'Multipayment'",
          "Pilih 'Virtual Account'",
          "Masukkan nomor Virtual Account",
          "Konfirmasi pembayaran"
        ]
      };
    } else {
      return {
        atm: [
          "Masukkan kartu ATM dan PIN",
          "Pilih menu 'Transfer'",
          "Pilih 'Virtual Account'",
          "Masukkan nomor Virtual Account",
          "Masukkan nominal transfer",
          "Konfirmasi pembayaran"
        ],
        mobile: [
          "Login ke aplikasi mobile banking",
          "Pilih menu 'Transfer'",
          "Pilih 'Virtual Account'",
          "Masukkan nomor Virtual Account",
          "Masukkan nominal transfer",
          "Konfirmasi pembayaran"
        ]
      };
    }
  };

  const instructions = getBankInstructions();

  const handleBackToInvoice = () => {
    navigate(-1);
  };

  const handleCheckPaymentStatus = () => {
    navigate('/payment-status', { 
      state: {
        ...paymentData,
        paymentType,
        amountPaid: paymentType === 'full' ? calculatedTotalHarga : dpAmount
      }
    });
  };

  const getCurrentAmount = () => {
    return paymentType === 'full' ? calculatedTotalHarga : dpAmount;
  };

  return (
    <div className="virtual-account-page">
      <div className="va-container">
        {/* Header */}
        <div className="va-header">
          <div className="bank-logo">
            🏦
          </div>
          <div className="header-content">
            <h1 className="va-title">Pembayaran Virtual Account</h1>
            <p className="bank-name">{paymentData.methodName}</p>
            <div className={`timer ${timeLeft === 'EXPIRED' ? 'expired' : ''}`}>
              <span className="timer-icon">⏰</span>
              <span className="timer-text">
                {timeLeft === 'EXPIRED' ? 'KADALUARSA' : `Sisa waktu: ${timeLeft}`}
              </span>
            </div>
          </div>
        </div>

        {/* Package & Participant Details */}
        <div className="details-card">
          <h3 className="card-title">
            <span className="card-icon">📋</span>
            Detail Pemesanan
          </h3>
          <div className="details-content">
            <div className="detail-row">
              <span className="detail-label">Paket Wisata:</span>
              <span className="detail-value">{namaPaket}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Harga per Orang:</span>
              <span className="detail-value">{formatRupiah(hargaPerOrang)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Jumlah Peserta:</span>
              <span className="detail-value">{totalPeserta} orang</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email Kontak:</span>
              <span className="detail-value">{emailKontak || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Harga:</span>
              <span className="detail-value">{formatRupiah(calculatedTotalHarga)}</span>
            </div>
          </div>
        </div>

        {/* Participants List */}
        {peserta && peserta.length > 0 && (
          <div className="participants-card">
            <h3 className="card-title">
              <span className="card-icon">👥</span>
              Data Peserta
            </h3>
            <div className="participants-list">
              {peserta.map((peserta, index) => (
                <div key={index} className="participant-item">
                  <div className="participant-header">
                    <h4>Peserta {index + 1}</h4>
                  </div>
                  <div className="participant-details">
                    <div className="participant-row">
                      <span>Nama:</span>
                      <span>{peserta.nama || '-'}</span>
                    </div>
                    <div className="participant-row">
                      <span>Telepon:</span>
                      <span>{peserta.telepon || '-'}</span>
                    </div>
                    <div className="participant-row">
                      <span>TTL:</span>
                      <span>{peserta.tempatLahir || '-'}, {peserta.tanggalLahir || '-'}</span>
                    </div>
                    <div className="participant-row full-width">
                      <span>Alamat:</span>
                      <span>{peserta.alamat || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Options */}
        <div className="payment-options-card">
          <h3 className="card-title">
            <span className="card-icon">💰</span>
            Pilihan Pembayaran
          </h3>
          <div className="payment-options">
            <div 
              className={`payment-option ${paymentType === 'full' ? 'active' : ''}`}
              onClick={() => setPaymentType('full')}
            >
              <div className="option-header">
                <div className="radio-button">
                  {paymentType === 'full' && <div className="radio-dot"></div>}
                </div>
                <div className="option-content">
                  <h4>Bayar Penuh</h4>
                  <p className="option-description">Bayar seluruh tagihan sekaligus</p>
                </div>
              </div>
              <div className="option-amount">
                {formatRupiah(calculatedTotalHarga)}
              </div>
            </div>

            <div 
              className={`payment-option ${paymentType === 'dp' ? 'active' : ''}`}
              onClick={() => setPaymentType('dp')}
            >
              <div className="option-header">
                <div className="radio-button">
                  {paymentType === 'dp' && <div className="radio-dot"></div>}
                </div>
                <div className="option-content">
                  <h4>Bayar DP (30%)</h4>
                  <p className="option-description">
                    Sisa pembayaran: {formatRupiah(sisaAmount)}
                  </p>
                </div>
              </div>
              <div className="option-amount">
                {formatRupiah(dpAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Virtual Account Card */}
        <div className="va-card">
          <h3 className="card-title">
            <span className="card-icon">💳</span>
            Nomor Virtual Account
          </h3>
          <div className="va-number-container">
            <span 
              className="va-number"
              onClick={copyVANumber}
              title="Klik untuk menyalin"
            >
              {paymentData.vaNumber}
            </span>
            <button 
              className={`copy-button ${copied ? 'copy-success' : ''}`}
              onClick={copyVANumber}
            >
              {copied ? '✓ Tersalin' : '📋 Salin'}
            </button>
          </div>
          <div className="payment-amount">
            <span className="amount-label">Jumlah yang harus dibayar:</span>
            <span className="amount-value">{formatRupiah(getCurrentAmount())}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions-card">
          <h3 className="card-title">
            <span className="card-icon">📋</span>
            Cara Pembayaran
          </h3>
          <div className="instructions-tabs">
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'atm' ? 'active' : ''}`}
                onClick={() => setActiveTab('atm')}
              >
                🏧 ATM
              </button>
              <button 
                className={`tab-button ${activeTab === 'mobile' ? 'active' : ''}`}
                onClick={() => setActiveTab('mobile')}
              >
                📱 Mobile Banking
              </button>
            </div>
            <div className="tab-content">
              <ol className="instructions-list">
                {instructions[activeTab].map((step, index) => (
                  <li key={index} className="instruction-item">
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="notes-card">
          <h3 className="card-title">
            <span className="card-icon">⚠️</span>
            Penting untuk Diperhatikan
          </h3>
          <ul className="notes-list">
            <li>Pastikan nominal yang ditransfer sesuai dengan jumlah tagihan</li>
            <li>Virtual Account akan otomatis nonaktif setelah batas waktu berakhir</li>
            <li>Simpan bukti pembayaran untuk keperluan konfirmasi</li>
            {paymentType === 'dp' && (
              <li className="highlight">
                <strong>Sisa pembayaran sebesar {formatRupiah(sisaAmount)} harus dilunasi sebelum keberangkatan</strong>
              </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="back-button"
            onClick={handleBackToInvoice}
          >
            <span>←</span>
            Kembali ke Invoice
          </button>
          <button 
            className="check-button"
            onClick={handleCheckPaymentStatus}
            disabled={timeLeft === 'EXPIRED'}
          >
            <span>🔄</span>
            Cek Status Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualAccount;