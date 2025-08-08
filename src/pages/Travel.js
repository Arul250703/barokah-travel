import React from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/travel.css';

// Import Aset Gambar dan Video (Pastikan path sesuai dengan struktur folder Anda)
import situ from '../assets/images/situ.jpeg';
import bro from '../assets/images/bro.jpeg';
import malio from '../assets/images/malio.jpeg';
import servicesBg from '../assets/images/services-bg.jpg';
import videoSection from '../assets/videos/video-section.mp4';

const Travel = () => {
    return (
        <div className="travel-page">
            <header className="travel-news-header">
                <h1>Travel News</h1>
                <p>Baca Informasi Menarik tentang destinasi hits yang akan kamu kunjungi</p>
            </header>

            <section className="news-list-section">
                <div className="news-item">
                    <img src={situ} alt="Situ Gunung" />
                    <div className="news-content">
                        <h2>Surga Tersembunyi di Sukabumi, Situ Gunung Lembah Purba.</h2>
                        <div className="news-meta">
                            <span>08 Juli 2025</span> • <span>10k</span> • <span>Destinasi, Wisata Alam</span>
                        </div>
                        <p>Lembah Purba di Sukabumi adalah destinasi wisata alam yang kini tengah viral… <Link to="/travel/1">Selengkapnya</Link></p>
                    </div>
                </div>

                <div className="news-item">
                    <img src={bro} alt="Borobudur" />
                    <div className="news-content">
                        <h2>7 Keajaiban Dunia yang berada di Yogyakarta Candi Borobudur</h2>
                        <div className="news-meta">
                            <span>08 Juli 2025</span> • <span>10k</span> • <span>Destinasi, Wisata Jogja</span>
                        </div>
                        <p>Candi Borobudur adalah candi Budha terbesar di dunia… <Link to="/travel/2">Selengkapnya</Link></p>
                    </div>
                </div>

                <div className="news-item">
                    <img src={malio} alt="Malioboro" />
                    <div className="news-content">
                        <h2>Menjelajahi Keindahan malam hari Jogjakarta</h2>
                        <div className="news-meta">
                            <span>08 Juli 2025</span> • <span>10k</span> • <span>Destinasi, Wisata Kuliner</span>
                        </div>
                        <p>Malioboro malam hari menyuguhkan suasana yang hangat… <Link to="/travel/3">Selengkapnya</Link></p>
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

export default Travel;
