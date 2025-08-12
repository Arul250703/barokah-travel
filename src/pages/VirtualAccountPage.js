import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/styles/VirtualAccountPage.css'; // Import CSS file

const VirtualAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState(false);

  // Mengambil data dari Invoice
  const paymentData = location.state || {
    namaPaket: "Data tidak tersedia",
    totalHarga: 0,
    paymentMethod: { name: "Bank", color: "#000" },
    virtualAccountNumber: "0000000000000",
    expiryTime: new Date()
  };

  // Format Rupiah
  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(paymentData.expiryTime).getTime();
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
  }, [paymentData.expiryTime]);

  // Copy Virtual Account Number
  const copyVANumber = () => {
    navigator.clipboard.writeText(paymentData.virtualAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get bank instructions
  const getBankInstructions = () => {
    const bankId = paymentData.paymentMethod.name.toLowerCase();
    
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
    } else if (bankId.includes('bni')) {
      return {
        atm: [
          "Masukkan kartu ATM BNI dan PIN",
          "Pilih menu 'Menu Lain'",
          "Pilih 'Transfer'",
          "Pilih 'Virtual Account Billing'",
          "Masukkan nomor Virtual Account",
          "Masukkan nominal transfer",
          "Konfirmasi pembayaran"
        ],
        mobile: [
          "Login ke aplikasi BNI Mobile Banking",
          "Pilih menu 'Transfer'",
          "Pilih 'Virtual Account Billing'",
          "Masukkan nomor Virtual Account",
          "Masukkan nominal transfer",
          "Konfirmasi pembayaran"
        ]
      };
    } else if (bankId.includes('bri')) {
      return {
        atm: [
          "Masukkan kartu ATM BRI dan PIN",
          "Pilih menu 'Transaksi Lain'",
          "Pilih 'Pembayaran'",
          "Pilih 'BRIVA'",
          "Masukkan nomor BRIVA",
          "Masukkan nominal pembayaran",
          "Konfirmasi pembayaran"
        ],
        mobile: [
          "Login ke aplikasi BRImo",
          "Pilih menu 'Pembayaran'",
          "Pilih 'BRIVA'",
          "Masukkan nomor BRIVA",
          "Masukkan nominal pembayaran",
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

  // Updated function - navigate to payment status page
  const handleCheckPaymentStatus = () => {
    navigate('/payment-status', { 
      state: paymentData 
    });
  };

  return (
    <div className="virtual-account-page">
      <div className="va-container">
        {/* Header */}
        <div className="va-header">
          <div 
            className="bank-logo" 
            style={{backgroundColor: paymentData.paymentMethod.color}}
          >
            🏦
          </div>
          <h1 className="va-title">Virtual Account</h1>
          <p className="bank-name">{paymentData.paymentMethod.name}</p>
        </div>

        {/* Payment Summary */}
        <div className="summary-card">
          <div className="summary-header">
            <h3 className="summary-title">Ringkasan Pembayaran</h3>
            <div className={`timer ${timeLeft === 'EXPIRED' ? 'expired' : ''}`}>
              <span className="timer-icon">⏰</span>
              <span className="timer-text">
                {timeLeft === 'EXPIRED' ? 'EXPIRED' : `Sisa waktu: ${timeLeft}`}
              </span>
            </div>
          </div>
          
          <div className="summary-content">
            <div className="summary-row">
              <span>Paket Wisata:</span>
              <strong>{paymentData.namaPaket}</strong>
            </div>
            <div className="summary-row">
              <span>Total Pembayaran:</span>
              <strong className="total-amount">{formatRupiah(paymentData.totalHarga)}</strong>
            </div>
          </div>
        </div>

        {/* Virtual Account Number */}
        <div className="va-card">
          <h3 className="va-title">Nomor Virtual Account</h3>
          <div className="va-number-container">
            <span 
              className="va-number"
              onClick={copyVANumber}
              title="Klik untuk menyalin"
            >
              {paymentData.virtualAccountNumber}
            </span>
            <button 
              className={`copy-button ${copied ? 'copy-success' : ''}`}
              onClick={copyVANumber}
            >
              {copied ? '✓ Tersalin' : '📋 Salin'}
            </button>
          </div>
          <p className="va-note">
            Gunakan nomor ini untuk melakukan pembayaran melalui ATM, Mobile Banking, atau Internet Banking
          </p>
        </div>

        {/* Payment Instructions */}
        <div className="instructions-card">
          <h3 className="instructions-title">📋 Cara Pembayaran</h3>
          
          <div className="instructions-tabs">
            <div className="tab-content">
              <h4 className="tab-title">🏧 Melalui ATM</h4>
              <ol className="instructions-list">
                {instructions.atm.map((step, index) => (
                  <li key={index} className="instruction-item">{step}</li>
                ))}
              </ol>
            </div>

            <div className="tab-content">
              <h4 className="tab-title">📱 Mobile Banking</h4>
              <ol className="instructions-list">
                {instructions.mobile.map((step, index) => (
                  <li key={index} className="instruction-item">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="notes-card">
          <h3 className="notes-title">⚠️ Penting untuk Diperhatikan</h3>
          <ul className="notes-list">
            <li>Transfer harus dilakukan dengan nominal yang tepat: <strong>{formatRupiah(paymentData.totalHarga)}</strong></li>
            <li>Simpan bukti transfer hingga pembayaran dikonfirmasi</li>
            <li>Virtual Account akan kedaluwarsa dalam 24 jam</li>
            <li>Jangan berikan nomor Virtual Account kepada orang lain</li>
            <li>Hubungi customer service jika ada kendala</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="back-button"
            onClick={handleBackToInvoice}
          >
            ← Kembali ke Invoice
          </button>
          <button 
            className="check-button"
            onClick={handleCheckPaymentStatus}
          >
            🔄 Cek Status Pembayaran
          </button>
        </div>

        {/* Footer */}
        <div className="va-footer">
          <p className="footer-text">
            Ada pertanyaan? Hubungi Customer Service kami di 
            <strong> 0804-1-500-000</strong> atau 
            <strong> cs@barokahtour.com</strong>
          </p>
          <p className="footer-text" style={{marginTop: '10px', fontSize: '12px'}}>
            Pastikan Anda melakukan pembayaran sebelum batas waktu yang ditentukan
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualAccount;