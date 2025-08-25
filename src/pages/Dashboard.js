import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../components/styles/Dashboard.css";
import Sidebar from "../components/Sidebar"; // Pastikan Sidebar.js ada

const Dashboard = () => {
  // Data dummy untuk dashboard
  const [stats] = useState({
    totalBookings: 154,
    newBookingsToday: 5,
    totalRevenue: 25000000,
  });

  const [recentBookings] = useState([
    {
      id: 1,
      name: "Paket Wisata Sukabumi",
      client: "Joko Widodo",
      status: "Confirmed",
      date: "2025-01-15",
    },
    {
      id: 2,
      name: "Paket Tour Lombok 3 Hari 2 Malam (A)",
      client: "Sri Mulyani",
      status: "Pending",
      date: "2025-01-14",
    },
    {
      id: 3,
      name: "WISATA LABUAN BAJO 3H2M",
      client: "Budi Santoso",
      status: "Confirmed",
      date: "2025-01-13",
    },
    {
      id: 4,
      name: "Paket Wisata Raja Ampat",
      client: "Siti Nurhaliza",
      status: "Processing",
      date: "2025-01-12",
    },
    {
      id: 5,
      name: "Tour Bromo Tengger Semeru",
      client: "Ahmad Dhani",
      status: "Pending",
      date: "2025-01-11",
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "✓";
      case "pending":
        return "⏳";
      case "processing":
        return "⚡";
      case "cancelled":
        return "✕";
      default:
        return "●";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard Admin</h1>
            <p className="dashboard-subtitle">
              Selamat datang di panel admin Anda. Kelola bisnis tour & travel
              dengan mudah dan efisien.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">
                <span role="img" aria-label="analytics">📊</span>
              </div>
              <h3>Total Pemesanan</h3>
              <p className="stat-value">{stats.totalBookings}</p>
              <div className="stat-trend">
                <span className="trend-up">↗ +12% dari bulan lalu</span>
              </div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-icon">
                <span role="img" aria-label="growth">📈</span>
              </div>
              <h3>Pemesanan Hari Ini</h3>
              <p className="stat-value">{stats.newBookingsToday}</p>
              <div className="stat-trend">
                <span className="trend-up">↗ +2 dari kemarin</span>
              </div>
            </div>

            <div className="stat-card stat-card-purple">
              <div className="stat-icon">
                <span role="img" aria-label="money">💰</span>
              </div>
              <h3>Total Pendapatan</h3>
              <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
              <div className="stat-trend">
                <span className="trend-up">↗ +8% dari bulan lalu</span>
              </div>
            </div>
          </div>

          {/* Recent Bookings Section */}
          <div className="recent-bookings-section">
            <div className="section-header">
              <h2 className="section-title">Pemesanan Terbaru</h2>
              <Link to="/bookings" className="view-all-link">
                Lihat Semua
              </Link>
            </div>

            <div className="recent-bookings-list">
              <ul>
                {recentBookings.map((booking, index) => (
                  <li key={booking.id} className="booking-item">
                    <div className="booking-details">
                      <div className="booking-number">{index + 1}</div>
                      <div className="booking-info">
                        <h4>{booking.name}</h4>
                        <div className="booking-meta">
                          <span className="booking-meta-item">
                            <span role="img" aria-label="person">👤</span> {booking.client}
                          </span>
                          <span className="booking-meta-item">
                            <span role="img" aria-label="calendar">📅</span> {formatDate(booking.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="booking-status-container">
                      <span
                        className={`booking-status ${booking.status.toLowerCase()}`}
                      >
                        {getStatusIcon(booking.status)}
                        <span>{booking.status}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2 className="section-title">Aksi Cepat</h2>
            <div className="quick-actions-grid">
              <Link to="/bookings/new" className="action-card action-card-primary">
                <div className="action-icon">
                  <span role="img" aria-label="plus">➕</span>
                </div>
                <h3 className="action-title">Tambah Pemesanan</h3>
              </Link>

              <Link to="/packages" className="action-card action-card-success">
                <div className="action-icon">
                  <span role="img" aria-label="package">📦</span>
                </div>
                <h3 className="action-title">Kelola Paket</h3>
              </Link>

              <Link to="/reports" className="action-card action-card-purple">
                <div className="action-icon">
                  <span role="img" aria-label="reports">📊</span>
                </div>
                <h3 className="action-title">Laporan</h3>
              </Link>

              <Link to="/settings" className="action-card action-card-slate">
                <div className="action-icon">
                  <span role="img" aria-label="settings">⚙️</span>
                </div>
                <h3 className="action-title">Pengaturan</h3>
              </Link>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="dashboard-footer">
            <Link to="/" className="back-link">
              <span>←</span>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;