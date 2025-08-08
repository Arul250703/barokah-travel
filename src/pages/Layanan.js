import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/layanan.css';

// Import Aset Gambar dan Video (Pastikan path sesuai dengan struktur folder Anda)
import servicesBg from '../assets/images/services-bg.jpg';
import videoSection from '../assets/videos/video-section.mp4';

const Layanan = () => {
    const [activeSlide, setActiveSlide] = useState(0); // State untuk mengelola slide aktif
    const slides = [
        { src: servicesBg, alt: "Slide 1" },
        { src: "images/gallery-5.jpg", alt: "Slide 2" },
        { src: "images/gallery-6.jpg", alt: "Slide 3" },
    ];

    // Fungsi untuk mengubah slide (opsional, bisa diintegrasikan dengan useEffect jika butuh autoplay)
    const changeSlide = (index) => {
        setActiveSlide(index);
    };

    return (
        <div className="layanan-page">
            <header className="hero-section">
                <div className="header-slider">
                    <div className="slider">
                        {slides.map((slide, index) => (
                            <img 
                                key={index} 
                                src={slide.src} 
                                className={index === activeSlide ? 'active' : ''} 
                                alt={slide.alt} 
                            />
                        ))}
                    </div>
                    <div className="header-overlay">
                        <h1>BAROKAH</h1>
                        <h2>SERVIS KAMI</h2>
                    </div>
                </div>
            </header>

            <section className="about-us-content">
                <div className="tentang-container">
                    <h2>Barokah Tour & Travel bergerak dalam bidang jasa:</h2>
                    <div className="services-list">
                        <p>Paket Wisata Rohani, Umroh dan Ziaroh (All In)</p>
                        <p>Tour Domestik dan Mancanegara</p>
                        <p>Ticketing Pesawat</p>
                        <p>MICE/EO/WO</p>
                        <p>Study Tour, Study Banding, Capacity Building, Kunjungan Kerja, dan Lainnya</p>
                        <p>Persewaan Transportasi Pariwisata</p>
                        <p>Agen Resmi PT. Taman Impian Jaya Ancol</p>
                        <p>Event Organizer</p>
                        <p>Team Building, Company Meeting, Gathering, and Outbound</p>
                        <p>Exhibition, ESQ, Expo, dan Bazar</p>
                    </div>
                </div>
            </section>

            <section className="custom-cta">
                <video autoPlay muted loop playsInline className="cta-video" src={videoSection} />
                <div className="cta-overlay">
                    <div className="cta-text">
                        <h2>Belum menemukan paket yang sesuai?</h2>
                        <p>Kami siap bantu merancang perjalanan khusus sesuai kebutuhan dan anggaran Anda!</p>
                        <a href="https://wa.me/6285930005544" className="cta-button">Chat Kami Sekarang</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Layanan;
