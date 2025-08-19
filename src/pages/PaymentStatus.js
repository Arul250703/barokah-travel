import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/styles/PaymentStatus.css';

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);

  // Data pembayaran dari Virtual Account
  const paymentData = useMemo(
    () =>
      location.state || {
        namaPaket: 'Data tidak tersedia',
        totalHarga: 0,
        paymentMethod: { name: 'Bank', color: '#000' },
        virtualAccountNumber: '0000000000000',
        expiryTime: new Date(),
      },
    [location.state]
  );

  // Format Rupiah
  const formatRupiah = (angka) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);

  // Format tanggal dan waktu
  const formatDateTime = (date) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

  // Mengecek status pembayaran
  useEffect(() => {
    const checkPaymentStatus = async () => {
      setIsChecking(true);

      try {
        // Simulasi delay API call (nanti ganti dengan API payment gateway nyata)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const now = new Date();
        const paymentTime = new Date(
          now.getTime() - Math.random() * 30 * 60 * 1000
        );
        const isPaid = Math.random() > 0.3; // 70% kemungkinan sudah bayar (demo)
        const isExpired = now > new Date(paymentData.expiryTime);

        if (isPaid) {
          const transaction = {
            transactionId: `TRX${Date.now().toString().slice(-8)}`,
            paymentTime,
            amount: paymentData.totalHarga,
            bankName: paymentData.paymentMethod.name,
            vaNumber: paymentData.virtualAccountNumber,
          };
          setPaymentStatus('success');
          setTransactionDetails(transaction);

          // Simpan ke localStorage supaya Laporan Keuangan bisa ambil
          localStorage.setItem(
            'lastPayment',
            JSON.stringify({
              ...paymentData,
              ...transaction,
              status: 'success',
            })
          );
        } else {
          setPaymentStatus(isExpired ? 'expired' : 'pending');

          // Simpan status pending/expired juga
          localStorage.setItem(
            'lastPayment',
            JSON.stringify({
              ...paymentData,
              status: isExpired ? 'expired' : 'pending',
            })
          );
        }
      } catch (error) {
        console.error('Gagal mengecek status pembayaran:', error);
        setPaymentStatus('pending');
      }

      setIsChecking(false);
    };

    checkPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData]);

  const handleBackToVA = () => navigate(-1);

  const handleContinueBooking = () => {
    navigate('/tiket-page', {
      state: {
        ...paymentData,
        transactionDetails,
      },
    });
  };

  const handleTryAgain = () => navigate(-1);

  const handleNewPayment = () =>
    navigate('/payment-method', { state: paymentData });

  // Render loading state
  if (isChecking) {
    return (
      <div className="payment-status-page">
        <div className="status-container">
          <div className="checking-card">
            <div className="loading-spinner"></div>
            <h2 className="checking-title">Mengecek Status Pembayaran</h2>
            <p className="checking-text">
              Mohon tunggu, kami sedang memverifikasi pembayaran Anda...
            </p>
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
        {/* Pembayaran Berhasil */}
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
                  <strong>
                    {formatDateTime(transactionDetails.paymentTime)}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Paket Wisata:</span>
                  <strong>{paymentData.namaPaket}</strong>
                </div>
                <div className="detail-row">
                  <span>Jumlah Dibayar:</span>
                  <strong className="amount-paid">
                    {formatRupiah(transactionDetails.amount)}
                  </strong>
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
                onClick={handleContinueBooking}
              >
                📄 Lihat Bukti Pemesanan
              </button>
              <button className="download-btn" onClick={() => window.print()}>
                💾 Simpan Bukti Transaksi
              </button>
            </div>
          </div>
        )}
        {paymentStatus === 'pending' && (
          <div className="status-card pending">
            <div className="status-icon pending-icon">⏳</div>
            <h1 className="status-title">Menunggu Pembayaran</h1>
            <p className="status-message">
              Pembayaran Anda belum diterima. Silakan lakukan transfer sesuai
              instruksi.
            </p>

            <div className="pending-details">
              <div className="detail-row">
                <span>Virtual Account:</span>
                <strong>{paymentData.virtualAccountNumber}</strong>
              </div>
              <div className="detail-row">
                <span>Jumlah yang harus dibayar:</span>
                <strong className="amount-due">
                  {formatRupiah(paymentData.totalHarga)}
                </strong>
              </div>
              <div className="detail-row">
                <span>Bank:</span>
                <strong>{paymentData.paymentMethod.name}</strong>
              </div>
            </div>

            <div className="pending-info">
              <h4>💡 Tips:</h4>
              <ul>
                <li>
                  Pastikan nominal transfer sesuai dengan jumlah yang tertera
                </li>
                <li>
                  Transfer dapat memakan waktu hingga 10 menit untuk diproses
                </li>
                <li>Simpan bukti transfer untuk referensi</li>
              </ul>
            </div>

            <div className="pending-actions">
              <button className="retry-btn" onClick={handleTryAgain}>
                🔄 Cek Lagi
              </button>
              <button className="back-btn" onClick={handleBackToVA}>
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
                <strong className="expired-va">
                  {paymentData.virtualAccountNumber}
                </strong>
              </div>
              <div className="detail-row">
                <span>Batas Waktu:</span>
                <strong>
                  {formatDateTime(new Date(paymentData.expiryTime))}
                </strong>
              </div>
            </div>

            <div className="expired-info">
              <p>
                Untuk melanjutkan pemesanan, Anda perlu membuat Virtual Account
                baru dengan batas waktu pembayaran yang baru.
              </p>
            </div>

            <div className="expired-actions">
              <button className="new-payment-btn" onClick={handleNewPayment}>
                💳 Buat Pembayaran Baru
              </button>
              <button className="back-btn" onClick={() => navigate('/')}>
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
