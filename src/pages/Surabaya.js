import React from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/surabaya.css';

// Import Aset Gambar dan Video (Pastikan path sesuai dengan struktur folder Anda)
import bali from '../assets/images/bali.jpeg';
import dreamland from '../assets/images/dreamland.jpeg';
import tanjung from '../assets/images/tanjung.jpeg';
import servicesBg from '../assets/images/services-bg.jpg';
import videoSection from '../assets/videos/video-section.mp4';

const Surabaya = () => {
    return (
        <div className="surabaya-page">
            <header className="hero-section" style={{ backgroundImage: `url(${servicesBg})` }}>
                <div className="header-overlay">
                    <h1>PAKET WISATA SURABAYA</h1>
                    <h2>Jelajahi keindahan kota pahlawan</h2>
                </div>
            </header>

            <section className="tour-cards-section">
                <h3 className="tour-section-title">
                    Pilihan Paket Wisata Surabaya
                </h3>
                <div className="scroll-container">
                    <div className="tour-card">
                        <img src={bali} alt="Tour Bali 2H1M" />
                        <h4>Tour Bali 2H1M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 837.000 </strong>
                        <Link to="/surabaya" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={bali} alt="Tour Bali 3H2M" />
                        <h4>Tour Bali 3H2M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 1.260.000</strong>
                        <Link to="/surabaya" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={dreamland} alt="Tour Bali 4H3M" />
                        <h4>Tour Bali 4H3M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 1.891.000</strong>
                        <Link to="/surabaya" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={tanjung} alt="Wisata Karimunjawa" />
                        <h4>Wisata Karimunjawa 2H1M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 670.000 </strong>
                        <Link to="/surabaya" className="detail-button">Lihat Detail</Link>
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

export default Surabaya;
