import React from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/yogyakarta.css';

// Import Aset Gambar dan Video (Pastikan path sesuai dengan struktur folder Anda)
import yogya from '../assets/images/yogya.jpeg';
import pinus from '../assets/images/pinus.jpeg';
import bro from '../assets/images/bro.jpeg';
import pram from '../assets/images/pram.jpeg';
import jeram from '../assets/images/jeram.jpeg';
import rj from '../assets/images/rj.jpeg';
import videoSection from '../assets/videos/video-section.mp4';
import servicesBg from '../assets/images/services-bg.jpg';

const Yogyakarta = () => {
    return (
        <div className="yogyakarta-page">
            <header className="hero-section" style={{ backgroundImage: `url(${servicesBg})` }}>
                <div className="header-overlay">
                    <h1>PAKET WISATA YOGYAKARTA</h1>
                    <h2>Jelajahi keistimewaan kota pelajar</h2>
                </div>
            </header>

            <section className="tour-cards-section">
                <h3 className="tour-section-title">
                    Pilihan Paket Wisata Yogyakarta
                </h3>
                <div className="scroll-container">
                    <div className="tour-card">
                        <img src={pinus} alt="Paket A Yogyakarta" />
                        <h4>PAKET A : YOGYAKARTA 2H1M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 992.000</strong>
                        <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={yogya} alt="Paket B Yogyakarta" />
                        <h4>PAKET B : YOGYAKARTA 2H1M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 874.000</strong>
                        <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={bro} alt="Paket C Yogyakarta" />
                        <h4>PAKET C : YOGYAKARTA 2H1M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 1.027.000</strong>
                        <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={pram} alt="Paket D Yogyakarta" />
                        <h4>PAKET D : YOGYAKARTA 2H1M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 1.016.000</strong>
                        <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={jeram} alt="Paket A Yogyakarta 3H2M" />
                        <h4>PAKET A : YOGYAKARTA 3H2M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 1.444.000</strong>
                        <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                    </div>
                    <div className="tour-card">
                        <img src={rj} alt="Yogyakarta 4H3M" />
                        <h4>WISATA YOGYAKARTA 4H3M</h4>
                        <p className="price-label">Mulai dari</p>
                        <strong className="price-value">IDR 1.928.000</strong>
                        <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
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

export default Yogyakarta;
