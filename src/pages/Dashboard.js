import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/Dashboard.css';

const Dashboard = () => {
    // Data dummy untuk dashboard
    const [stats, setStats] = useState({
        totalBookings: 154,
        newBookingsToday: 5,
        totalRevenue: 25000000
    });

    const [recentBookings, setRecentBookings] = useState([
        { id: 1, name: 'Paket Wisata Sukabumi', client: 'Joko Widodo', status: 'Confirmed' },
        { id: 2, name: 'Paket Tour Lombok 3 Hari 2 Malam (A)', client: 'Sri Mulyani', status: 'Pending' },
        { id: 3, name: 'WISATA LABUAN BAJO 3H2M', client: 'Budi Santoso', status: 'Confirmed' },
    ]);

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <h1 className="dashboard-title">Dashboard Admin</h1>
                <p className="dashboard-subtitle">Selamat datang di panel admin Anda.</p>
                
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Pemesanan</h3>
                        <p className="stat-value">{stats.totalBookings}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pemesanan Baru Hari Ini</h3>
                        <p className="stat-value">{stats.newBookingsToday}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Pendapatan</h3>
                        <p className="stat-value">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <div className="recent-bookings">
                    <h2 className="section-title">Pemesanan Terbaru</h2>
                    <ul>
                        {recentBookings.map(booking => (
                            <li key={booking.id} className="booking-item">
                                <div className="booking-info">
                                    <h4>{booking.name}</h4>
                                    <p>Klien: {booking.client}</p>
                                </div>
                                <span className={`booking-status ${booking.status.toLowerCase()}`}>
                                    {booking.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="dashboard-actions">
                    <Link to="/" className="back-link">Kembali ke Beranda</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
