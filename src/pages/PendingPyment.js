import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Mail, 
  Download, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Eye,
  MessageCircle,
  Loader,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import Styles from '../components/styles/PendingPayment.module.css';

const PendingPaymentsDashboard = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const stats = {
    totalPending: filteredPayments.length,
    totalAmount: filteredPayments.reduce((sum, item) => sum + item.remaining_amount, 0),
    overdueCount: filteredPayments.filter(item => new Date(item.due_date) < new Date()).length
  };

  // Fetch data dari API
  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulasi data dari database (gantikan dengan API call sebenarnya)
      const mockData = [
        {
          id: 1,
          booking_id: 'BRK-2023-001',
          customer_name: 'Bacik',
          customer_email: 'bacik@gmail.com',
          customer_phone: '6283873645789',
          package_name: 'Paket Wisata Lombok 4D3N',
          total_price: 4500000,
          paid_amount: 1500000,
          remaining_amount: 3000000,
          status: 'menunggu_pembayaran',
          due_date: '2023-12-15',
          created_at: '2023-12-01T10:00:00Z'
        },
        {
          id: 2,
          booking_id: 'BRK-2023-002',
          customer_name: 'Siti Rahayu',
          customer_email: 'siti.rahayu@example.com',
          customer_phone: '081298765432',
          package_name: 'Paket Umroh Plus Turki 12D',
          total_price: 38500000,
          paid_amount: 10000000,
          remaining_amount: 28500000,
          status: 'dp_lunas',
          due_date: '2023-12-10',
          created_at: '2023-11-28T14:30:00Z'
        },
        {
          id: 3,
          booking_id: 'BRK-2023-003',
          customer_name: 'Budi Santoso',
          customer_email: 'budi.santoso@example.com',
          customer_phone: '081312345678',
          package_name: 'Paket Haji Khusus 40D',
          total_price: 68500000,
          paid_amount: 0,
          remaining_amount: 68500000,
          status: 'menunggu_pembayaran',
          due_date: '2023-12-05',
          created_at: '2023-11-30T09:15:00Z'
        }
      ];

      // Untuk production, gunakan API call berikut:
      /*
      const response = await fetch('/api/bookings/pending-payments');
      if (!response.ok) {
        throw new Error('Gagal mengambil data pembayaran');
      }
      const data = await response.json();
      */
      
      // Simulasi delay network
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingPayments(mockData);
      setFilteredPayments(mockData);
      
    } catch (err) {
      console.error('Error fetching pending payments:', err);
      setError('Gagal memuat data pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // Filter data berdasarkan pencarian dan filter status
  useEffect(() => {
    let result = pendingPayments;
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.customer_name.toLowerCase().includes(term) ||
        item.booking_id.toLowerCase().includes(term) ||
        item.package_name.toLowerCase().includes(term)
      );
    }
    
    // Filter berdasarkan status
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredPayments(result);
  }, [searchTerm, statusFilter, pendingPayments]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getStatusBadge = (item) => {
    const isLate = isOverdue(item.due_date);
    const status = item.status;
    
    let statusClass = '';
    let icon = null;
    let text = '';
    
    if (status === 'menunggu_pembayaran') {
      statusClass = isLate ? Styles.statusOverdue : Styles.statusWaiting;
      icon = isLate ? <AlertTriangle className={Styles.statusIcon} /> : <Clock className={Styles.statusIcon} />;
      text = isLate ? 'Terlambat' : 'Menunggu Pembayaran';
    } else if (status === 'dp_lunas') {
      statusClass = isLate ? Styles.statusOverdue : Styles.statusPartial;
      icon = isLate ? <AlertTriangle className={Styles.statusIcon} /> : <CheckCircle className={Styles.statusIcon} />;
      text = isLate ? 'Terlambat' : 'DP Lunas';
    }
    
    return (
      <span className={`${Styles.statusBadge} ${statusClass}`}>
        {icon}
        {text}
      </span>
    );
  };

  const openInvoiceModal = (payment) => {
    setSelectedInvoice(payment);
    setShowInvoiceModal(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
  };

  const sendInvoiceEmail = (payment) => {
    const subject = `Tagihan Pembayaran - ${payment.booking_id}`;
    const body = `
Yth. ${payment.customer_name},
Berikut adalah tagihan pembayaran untuk booking Anda:
Booking ID: ${payment.booking_id}
Paket: ${payment.package_name}
Total Harga: ${formatCurrency(payment.total_price)}
Sudah Dibayar: ${formatCurrency(payment.paid_amount)}
Sisa Pembayaran: ${formatCurrency(payment.remaining_amount)}
Jatuh Tempo: ${formatDate(payment.due_date)}
Mohon segera melakukan pembayaran sebelum jatuh tempo.
Terima kasih,
Barokah Tour & Travel
    `.trim();
    const mailtoLink = `mailto:${payment.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const sendWhatsAppMessage = (payment) => {
    const message = `
Halo ${payment.customer_name},
Kami ingin mengingatkan tentang sisa pembayaran Anda:
📋 Booking ID: ${payment.booking_id}
🎯 Paket: ${payment.package_name}
💰 Total: ${formatCurrency(payment.total_price)}
💳 Sudah Dibayar: ${formatCurrency(payment.paid_amount)}
💰 Sisa Pembayaran: ${formatCurrency(payment.remaining_amount)}
📅 Jatuh Tempo: ${formatDate(payment.due_date)}
Mohon segera melakukan pembayaran. Terima kasih!
*Barokah Tour & Travel*
    `.trim();
    const phoneNumber = payment.customer_phone.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  const downloadInvoice = (payment) => {
    const invoiceContent = `
INVOICE PEMBAYARAN
==================
Barokah Tour & Travel
Jl. Contoh No. 123, Jakarta
Telp: (021) 123-4567
-----------------------------------
Kepada:
${payment.customer_name}
Email: ${payment.customer_email}
Telp: ${payment.customer_phone}
-----------------------------------
DETAIL PEMBAYARAN:
Booking ID: ${payment.booking_id}
Paket: ${payment.package_name}
Tanggal Booking: ${formatDate(payment.created_at)}
Jatuh Tempo: ${formatDate(payment.due_date)}
Total Harga: ${formatCurrency(payment.total_price)}
Sudah Dibayar: ${formatCurrency(payment.paid_amount)}
SISA PEMBAYARAN: ${formatCurrency(payment.remaining_amount)}
-----------------------------------
Mohon segera melakukan pembayaran sebelum jatuh tempo.
Terima kasih atas kepercayaan Anda.
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${payment.booking_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const markAsPaid = async (bookingId) => {
    try {
      // Simulasi API call untuk mengubah status
      console.log(`Mengubah status booking ${bookingId} menjadi lunas`);
      
      // Untuk production, gunakan:
      /*
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'lunas'
        })
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengubah status pembayaran');
      }
      */
      
      alert('Status berhasil diubah menjadi Lunas!');
      fetchPendingPayments(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat mengubah status');
    }
  };

  if (loading) {
    return (
      <div className={Styles.loadingContainer}>
        <div className={Styles.loadingContent}>
          <Loader className={Styles.spinner} />
          <p className={Styles.loadingText}>Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={Styles.errorContainer}>
        <div className={Styles.errorContent}>
          <AlertTriangle className={Styles.errorIcon} />
          <p className={Styles.errorText}>{error}</p>
          <button 
            onClick={fetchPendingPayments}
            className={Styles.retryButton}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={Styles.container}>
      <div className={Styles.innerContainer}>
        {/* Header */}
        <div className={Styles.header}>
          <div className={Styles.headerContent}>
            <div>
              <h1 className={Styles.title}>
                <CreditCard className={Styles.titleIcon} />
                Pembayaran Tertunda
              </h1>
              <p className={Styles.subtitle}>
                Kelola dan kirim tagihan untuk pembayaran yang belum lunas
              </p>
            </div>
            <button
              onClick={fetchPendingPayments}
              className={Styles.refreshButton}
            >
              <RefreshCw className={Styles.refreshIcon} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={Styles.statsGrid}>
          <div className={Styles.statCard}>
            <div className={Styles.statCardContent}>
              <div>
                <p className={Styles.statLabel}>Total Tertunda</p>
                <p className={Styles.statValue}>{stats.totalPending}</p>
              </div>
              <div className={Styles.statIconContainer}>
                <Clock className={Styles.statIcon} />
              </div>
            </div>
          </div>
          <div className={Styles.statCard}>
            <div className={Styles.statCardContent}>
              <div>
                <p className={Styles.statLabel}>Jumlah Tertunda</p>
                <p className={Styles.statValue}>{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className={Styles.statIconContainer}>
                <CreditCard className={Styles.statIcon} />
              </div>
            </div>
          </div>
          <div className={Styles.statCard}>
            <div className={Styles.statCardContent}>
              <div>
                <p className={Styles.statLabel}>Terlambat</p>
                <p className={Styles.statValue}>{stats.overdueCount}</p>
              </div>
              <div className={Styles.statIconContainer}>
                <AlertTriangle className={Styles.statIcon} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className={Styles.filterSection}>
          <div className={Styles.searchBox}>
            <Search className={Styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, booking ID, atau paket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={Styles.searchInput}
            />
          </div>
          <div className={Styles.filterGroup}>
            <Filter className={Styles.filterIcon} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className={Styles.filterSelect}
            >
              <option value="all">Semua Status</option>
              <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
              <option value="dp_lunas">DP Lunas</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className={Styles.tableContainer}>
          <div className={Styles.tableHeader}>
            <h2 className={Styles.tableTitle}>Daftar Pembayaran Tertunda</h2>
            <p className={Styles.tableSubtitle}>Klik "Lihat Invoice" untuk melihat detail dan mengirim tagihan</p>
          </div>
          <div className={Styles.tableWrapper}>
            <table className={Styles.table}>
              <thead className={Styles.tableHead}>
                <tr>
                  <th className={Styles.tableHeaderCell}>Customer</th>
                  <th className={Styles.tableHeaderCell}>Booking ID</th>
                  <th className={Styles.tableHeaderCell}>Paket</th>
                  <th className={Styles.tableHeaderCell}>Sisa Bayar</th>
                  <th className={Styles.tableHeaderCell}>Jatuh Tempo</th>
                  <th className={Styles.tableHeaderCell}>Status</th>
                  <th className={Styles.tableHeaderCell}>Aksi</th>
                </tr>
              </thead>
              <tbody className={Styles.tableBody}>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={Styles.noData}>
                      {pendingPayments.length === 0 
                        ? "Tidak ada pembayaran tertunda" 
                        : "Tidak ditemukan data yang sesuai dengan filter"}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className={Styles.tableRow}>
                      <td className={Styles.tableCell}>
                        <div className={Styles.customerInfo}>
                          <div className={Styles.customerAvatar}>
                            {payment.customer_name.charAt(0)}
                          </div>
                          <div className={Styles.customerDetails}>
                            <p className={Styles.customerName}>{payment.customer_name}</p>
                            <p className={Styles.customerEmail}>{payment.customer_email}</p>
                            <p className={Styles.customerPhone}>{payment.customer_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className={Styles.tableCell}>
                        <span className={Styles.bookingId}>
                          {payment.booking_id}
                        </span>
                      </td>
                      <td className={Styles.tableCell}>
                        <p className={Styles.packageName}>{payment.package_name}</p>
                      </td>
                      <td className={Styles.tableCell}>
                        <div>
                          <p className={Styles.remainingAmount}>{formatCurrency(payment.remaining_amount)}</p>
                          <p className={Styles.totalAmount}>
                            dari {formatCurrency(payment.total_price)}
                          </p>
                        </div>
                      </td>
                      <td className={Styles.tableCell}>
                        <p className={isOverdue(payment.due_date) ? Styles.overdueDate : Styles.dueDate}>
                          {formatDate(payment.due_date)}
                        </p>
                      </td>
                      <td className={Styles.tableCell}>
                        {getStatusBadge(payment)}
                      </td>
                      <td className={Styles.tableCell}>
                        <div className={Styles.actionGroup}>
                          <button
                            onClick={() => openInvoiceModal(payment)}
                            className={Styles.viewButton}
                          >
                            <Eye className={Styles.buttonIcon} />
                            Invoice
                          </button>
                          <button
                            onClick={() => markAsPaid(payment.id)}
                            className={Styles.paidButton}
                          >
                            <CheckCircle className={Styles.buttonIcon} />
                            Lunas
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className={Styles.modalBackdrop} onClick={closeInvoiceModal}>
            <div className={Styles.modalContent} onClick={(e) => e.stopPropagation()}>
              {/* Invoice Header */}
              <div className={Styles.modalHeader}>
                <div className={Styles.modalHeaderContent}>
                  <div>
                    <h2 className={Styles.invoiceTitle}>INVOICE</h2>
                    <p className={Styles.companyName}>Barokah Tour & Travel</p>
                  </div>
                  <button
                    onClick={closeInvoiceModal}
                    className={Styles.closeButton}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Invoice Content */}
              <div className={Styles.modalBody}>
                {/* Company & Customer Info */}
                <div className={Styles.infoSection}>
                  <div>
                    <h3 className={Styles.infoTitle}>Dari:</h3>
                    <div className={Styles.infoBox}>
                      <p className={Styles.companyName}>Barokah Tour & Travel</p>
                      <p className={Styles.companyAddress}>Jl. Raya Umroh No. 123</p>
                      <p className={Styles.companyAddress}>Jakarta Selatan, 12345</p>
                      <p className={Styles.companyContact}>Telp: (021) 123-4567</p>
                      <p className={Styles.companyContact}>Email: info@barokahtour.com</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={Styles.infoTitle}>Kepada:</h3>
                    <div className={Styles.infoBox}>
                      <p className={Styles.customerName}>{selectedInvoice.customer_name}</p>
                      <p className={Styles.customerContact}>{selectedInvoice.customer_email}</p>
                      <p className={Styles.customerContact}>{selectedInvoice.customer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className={Styles.detailCard}>
                  <div className={Styles.detailGrid}>
                    <div>
                      <p className={Styles.detailLabel}>Invoice #</p>
                      <p className={Styles.detailValue}>{selectedInvoice.booking_id}</p>
                    </div>
                    <div>
                      <p className={Styles.detailLabel}>Tanggal</p>
                      <p className={Styles.detailValue}>{formatDate(selectedInvoice.created_at)}</p>
                    </div>
                    <div>
                      <p className={Styles.detailLabel}>Jatuh Tempo</p>
                      <p className={isOverdue(selectedInvoice.due_date) ? Styles.overdueDetail : Styles.detailValue}>
                        {formatDate(selectedInvoice.due_date)}
                      </p>
                    </div>
                    <div>
                      <p className={Styles.detailLabel}>Status</p>
                      <p className={Styles.detailValue}>
                        {selectedInvoice.status === 'menunggu_pembayaran' ? 'Menunggu Pembayaran' : 'DP Lunas'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className={Styles.paymentBreakdown}>
                  <h3 className={Styles.breakdownTitle}>Rincian Pembayaran</h3>
                  <div className={Styles.paymentTableContainer}>
                    <table className={Styles.paymentTable}>
                      <thead className={Styles.paymentTableHead}>
                        <tr>
                          <th className={Styles.paymentTableHeader}>Deskripsi</th>
                          <th className={Styles.paymentTableHeader}>Jumlah</th>
                        </tr>
                      </thead>
                      <tbody className={Styles.paymentTableBody}>
                        <tr>
                          <td className={Styles.paymentTableCell}>{selectedInvoice.package_name}</td>
                          <td className={Styles.paymentTableCell}>{formatCurrency(selectedInvoice.total_price)}</td>
                        </tr>
                        <tr className={Styles.paidRow}>
                          <td className={Styles.paymentTableCell}>Sudah Dibayar</td>
                          <td className={Styles.paymentTableCell}>-{formatCurrency(selectedInvoice.paid_amount)}</td>
                        </tr>
                        <tr className={Styles.remainingRow}>
                          <td className={Styles.paymentTableCell}>SISA PEMBAYARAN</td>
                          <td className={Styles.paymentTableCell}>{formatCurrency(selectedInvoice.remaining_amount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className={Styles.instructionsBox}>
                  <h4 className={Styles.instructionsTitle}>Informasi Pembayaran</h4>
                  <div className={Styles.instructionsGrid}>
                    <div>
                      <p className={Styles.instructionsText}>Bank Transfer:</p>
                      <p className={Styles.instructionsDetail}>BCA: 1234567890</p>
                      <p className={Styles.instructionsDetail}>a.n. Barokah Tour & Travel</p>
                    </div>
                    <div>
                      <p className={Styles.instructionsText}>Konfirmasi:</p>
                      <p className={Styles.instructionsDetail}>WA: 0812-3456-7890</p>
                      <p className={Styles.instructionsDetail}>Email: payment@barokahtour.com</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={Styles.actionButtons}>
                  <button
                    onClick={() => sendInvoiceEmail(selectedInvoice)}
                    className={`${Styles.actionButton} ${Styles.emailButton}`}
                  >
                    <Mail className={Styles.actionIcon} />
                    Kirim via Email
                  </button>
                  
                  <button
                    onClick={() => sendWhatsAppMessage(selectedInvoice)}
                    className={`${Styles.actionButton} ${Styles.whatsappButton}`}
                  >
                    <MessageCircle className={Styles.actionIcon} />
                    Kirim via WhatsApp
                  </button>
                  
                  <button
                    onClick={() => downloadInvoice(selectedInvoice)}
                    className={`${Styles.actionButton} ${Styles.downloadButton}`}
                  >
                    <Download className={Styles.actionIcon} />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingPaymentsDashboard;