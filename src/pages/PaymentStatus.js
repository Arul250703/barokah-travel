import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/styles/PaymentStatus.css';

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);

  // Data pembayaran dari Virtual Account
  const paymentData = React.useMemo(() => (
    location.state || {
      namaPaket: "Data tidak tersedia",
      totalHarga: 0,
      paymentMethod: { name: "Bank", color: "#000" },
      virtualAccountNumber: "0000000000000",
      expiryTime: new Date()
    }
  ), [location.state]);

  // Format Rupiah
  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  // Format tanggal dan waktu
  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Simulasi pengecekan status pembayaran
  useEffect(() => {
    const checkPaymentStatus = async () => {
      setIsChecking(true);
      
      // Simulasi delay API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulasi logika pembayaran berdasarkan waktu atau kondisi tertentu
      const now = new Date();
      const vaNumber = paymentData.virtualAccountNumber;
      const paymentTime = new Date(now.getTime() - Math.random() * 30 * 60 * 1000); // Random waktu dalam 30 menit terakhir
      
      // Logika sederhana untuk menentukan status pembayaran
      // Dalam implementasi nyata, ini akan mengecek ke database atau API payment gateway
      const isPaid = Math.random() > 0.3; // 70% kemungkinan sudah bayar (untuk demo)
      
      if (isPaid) {
        setPaymentStatus('success');
        setTransactionDetails({
          transactionId: `TRX${Date.now().toString().slice(-8)}`,
          paymentTime: paymentTime,
          amount: paymentData.totalHarga,
          bankName: paymentData.paymentMethod.name,
          vaNumber: paymentData.virtualAccountNumber
        });
      } else {
        // Cek apakah sudah expired
        const isExpired = now > new Date(paymentData.expiryTime);
        setPaymentStatus(isExpired ? 'expired' : 'pending');
      }
      
      setIsChecking(false);
    };

    checkPaymentStatus();
  }, [paymentData]);

  const handleBackToVA = () => {
    navigate(-1);
  };

  const handleContinueBooking = () => {
    // Redirect ke halaman selanjutnya setelah pembayaran berhasil
    navigate('/tiket-page', { 
      state: { 
        ...paymentData, 
        transactionDetails 
      } 
    });
  };

  const handleTryAgain = () => {
    // Kembali ke Virtual Account untuk mencoba lagi
    navigate(-1);
  };

  const handleNewPayment = () => {
    // Kembali ke halaman pemilihan metode pembayaran
    navigate('/payment-method', { state: paymentData });
  };

  // Render loading state
  if (isChecking) {
    return (
      <div className="payment-status-page">
        <div className="status-container">
          <div className="checking-card">
            <div className="loading-spinner"></div>
            <h2 className="checking-title">Mengecek Status Pembayaran</h2>
            <p className="checking-text">Mohon tunggu, kami sedang memverifikasi pembayaran Anda...</p>
            <div className="checking-details">
              <div className="detail-row">
                <span>Virtual Account:</span>
                <strong>{paymentData.virtualAccountNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Jumlah:</span>
                <strong>{formatRupiah(paymentData.totalHarga)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render berdasarkan status pembayaran
  return (
    <div className="payment-status-page">
      <div className="status-container">
        
        /* Pembayaran Berhasil */
        {paymentStatus === 'success' && (
          <div className="status-card success">
            <div className="status-icon success-icon">✅</div>
            <h1 className="status-title">Pembayaran Berhasil!</h1>
            <p className="status-message">
              Terima kasih! Pembayaran Anda telah berhasil diproses.
            </p>
            
            <div className="transaction-details">
              <h3 className="details-title">Detail Transaksi</h3>
              <div className="details-content">
                <div className="detail-row">
                  <span>ID Transaksi:</span>
                  <strong>{transactionDetails.transactionId}</strong>
                </div>
                <div className="detail-row">
                  <span>Waktu Pembayaran:</span>
                  <strong>{formatDateTime(transactionDetails.paymentTime)}</strong>
                </div>
                <div className="detail-row">
                  <span>Paket Wisata:</span>
                  <strong>{paymentData.namaPaket}</strong>
                </div>
                <div className="detail-row">
                  <span>Jumlah Dibayar:</span>
                  <strong className="amount-paid">{formatRupiah(transactionDetails.amount)}</strong>
                </div>
                <div className="detail-row">
                  <span>Metode Pembayaran:</span>
                  <strong>{transactionDetails.bankName} Virtual Account</strong>
                </div>
                <div className="detail-row">
                  <span>Nomor VA:</span>
                  <strong>{transactionDetails.vaNumber}</strong>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button 
                className="continue-btn"
                onClick={() => navigate('/tiket-page', { state: { ...paymentData, transactionDetails } })}
              >
                📄 Lihat Bukti Pemesanan
              </button>
              <button 
                className="download-btn"
                onClick={() => window.print()}
              >
                💾 Simpan Bukti Transaksi
              </button>
            </div>
          </div>
        )}}
        {paymentStatus === 'pending' && (
          <div className="status-card pending">
            <div className="status-icon pending-icon">⏳</div>
            <h1 className="status-title">Menunggu Pembayaran</h1>
            <p className="status-message">
              Pembayaran Anda belum diterima. Silakan lakukan transfer sesuai instruksi.
            </p>
            
            <div className="pending-details">
              <div className="detail-row">
                <span>Virtual Account:</span>
                <strong>{paymentData.virtualAccountNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Jumlah yang harus dibayar:</span>
                <strong className="amount-due">{formatRupiah(paymentData.totalHarga)}</strong>
              </div>
              <div className="detail-row">
                <span>Bank:</span>
                <strong>{paymentData.paymentMethod.name}</strong>
              </div>
            </div>

            <div className="pending-info">
              <h4>💡 Tips:</h4>
              <ul>
                <li>Pastikan nominal transfer sesuai dengan jumlah yang tertera</li>
                <li>Transfer dapat memakan waktu hingga 10 menit untuk diproses</li>
                <li>Simpan bukti transfer untuk referensi</li>
              </ul>
            </div>

            <div className="pending-actions">
              <button 
                className="retry-btn"
                onClick={handleTryAgain}
              >
                🔄 Cek Lagi
              </button>
              <button 
                className="back-btn"
                onClick={handleBackToVA}
              >
                ← Kembali ke Virtual Account
              </button>
            </div>
          </div>
        )}

        {/* Virtual Account Expired */}
        {paymentStatus === 'expired' && (
          <div className="status-card expired">
            <div className="status-icon expired-icon">❌</div>
            <h1 className="status-title">Virtual Account Kedaluwarsa</h1>
            <p className="status-message">
              Maaf, waktu pembayaran telah habis. Silakan buat pembayaran baru.
            </p>
            
            <div className="expired-details">
              <div className="detail-row">
                <span>Virtual Account:</span>
                <strong className="expired-va">{paymentData.virtualAccountNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Batas Waktu:</span>
                <strong>{formatDateTime(new Date(paymentData.expiryTime))}</strong>
              </div>
            </div>

            <div className="expired-info">
              <p>
                Untuk melanjutkan pemesanan, Anda perlu membuat Virtual Account baru 
                dengan batas waktu pembayaran yang baru.
              </p>
            </div>

            <div className="expired-actions">
              <button 
                className="new-payment-btn"
                onClick={handleNewPayment}
              >
                💳 Buat Pembayaran Baru
              </button>
              <button 
                className="back-btn"
                onClick={() => navigate('/')}
              >
                🏠 Kembali ke Beranda
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="status-footer">
          <p>
            Butuh bantuan? Hubungi Customer Service: 
            <strong> 0804-1-500-000</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;