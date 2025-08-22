import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/Dashboard.css'; // Pastikan path CSS ini benar
import { FaBoxOpen, FaPlus, FaChartBar, FaCog, FaFileInvoice, FaUsers, FaMoneyBillWave } from 'react-icons/fa';

const Dashboard = () => {
  // State untuk menyimpan data dari backend
  const [dashboardData, setDashboardData] = useState({
    stats: { totalBookings: 0, newBookingsToday: 0, totalRevenue: 0 },
    recentBookings: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mengambil data dari backend saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/dashboard-stats');
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data dasbor:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => 
    new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount || 0);

  if (isLoading) {
    return <div className="loading-container">Memuat data dasbor...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Selamat datang kembali, Admin!</p>
        </div>
        <Link to="/keuangan/new" className="add-booking-btn">
          <FaPlus /> Tambah Booking
        </Link>
      </div>

      {/* Kartu Statistik */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><FaFileInvoice /></div>
          <div className="stat-info">
            <span className="stat-title">Total Pemesanan</span>
            <span className="stat-value">{dashboardData.stats.totalBookings}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><FaUsers /></div>
          <div className="stat-info">
            <span className="stat-title">Pemesanan Hari Ini</span>
            <span className="stat-value">{dashboardData.stats.newBookingsToday}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <span className="stat-title">Total Pendapatan</span>
            <span className="stat-value">{formatCurrency(dashboardData.stats.totalRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-content">
        {/* Kolom Kiri: Booking Terbaru */}
        <div className="recent-bookings">
          <h2 className="section-title">Aktivitas Booking Terbaru</h2>
          <ul className="booking-list">
            {dashboardData.recentBookings.map(booking => (
              <li key={booking.id} className="booking-item">
                <div className="booking-details">
                  <span className="booking-client">{booking.client}</span>
                  <span className="booking-package">memesan "{booking.name}"</span>
                </div>
                <span className={`booking-status status-${booking.status.toLowerCase()}`}>{booking.status}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom Kanan: Aksi Cepat */}
        <div className="quick-actions">
          <h2 className="section-title">Aksi Cepat</h2>
          <div className="action-grid">
            <Link to="/keuangan" className="action-card">
              <FaFileInvoice />
              <span>Laporan Keuangan</span>
            </Link>
            <Link to="/users" className="action-card">
              <FaUsers />
              <span>Kelola Pengguna</span>
            </Link>
            <Link to="/packages" className="action-card">
              <FaBoxOpen />
              <span>Kelola Paket</span>
            </Link>
            <Link to="/settings" className="action-card">
              <FaCog />
              <span>Pengaturan</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
