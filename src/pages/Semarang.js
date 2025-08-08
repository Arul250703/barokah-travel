import React from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/semarang.css';

// Import Aset Gambar dan Video (Pastikan path sesuai dengan struktur folder Anda)
import songo from '../assets/images/songo.jpeg';
import dusun from '../assets/images/dusun.jpeg';
import pink from '../assets/images/pink.jpeg';
import gili from '../assets/images/gili.jpeg';
import servicesBg from '../assets/images/services-bg.jpg';
import videoSection from '../assets/videos/video-section.mp4';

const Semarang = () => {
    return (
        <div className="semarang-page">
            <header className="hero-section" style={{ backgroundImage: `url(${servicesBg})` }}>
                <div className="header-overlay">
                    <h1>PAKET WISATA SEMARANG</h1>
                    <h2>Jelajahi keindahan kota lumpia</h2>
                </div>
            </header>

            <section className="tour-cards-section">
                <h3 className="tour-section-title">
                    Pilihan Paket Wisata Semarang
                </h3>
                <div className="scroll-container">
                    <div className="tour-card">
                        <img src={songo} alt="TRIP SEMARANG 1" />
                        <h4>2H1M TRIP SEMARANG 1</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 1.163.000</strong>
                        <Link to="/semarang" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={dusun} alt="TRIP SEMARANG 2" />
                        <h4>2H1M TRIP SEMARANG 2</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 1.163.000</strong>
                        <Link to="/semarang" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={pink} alt="WISATA LABUAN BAJO" />
                        <h4>WISATA LABUAN BAJO 3H2M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 3.650.000</strong>
                        <Link to="/semarang" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={gili} alt="PAKET B : LOMBOK" />
                        <h4>PAKET B : LOMBOK ONE DAY</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 460.000</strong>
                        <Link to="/semarang" className="detail-button">Lihat Detail</Link>
                    </div>
                </div>
            </section>

            <section className="custom-cta">
                <video autoPlay muted loop playsInline className="cta-video" src={videoSection} />
                <div className="cta-overlay">
                    <div className="cta-text">
                        <h2>Belum menemukan paket yang sesuai?</h2>
                        <p>Kami siap bantu merancang perjalanan khusus sesuai kebutuhan dan anggaran Anda!</p>
                        <a href="https://wa.me/6285930005544" className="cta-button" target="_blank" rel="noopener noreferrer">Chat Kami Sekarang</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Semarang;
