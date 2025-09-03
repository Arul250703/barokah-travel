import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/cabang.css';

// Import Aset Gambar dan Video (Pastikan path sesuai dengan struktur folder Anda)
import servicesBg from '../assets/images/services-bg.jpg';
import videoSection from '../assets/videos/video-section.mp4';
import mandiri from '../assets/images/mandiri.png';
import bca from '../assets/images/bca.png';
import bni from '../assets/images/bni.png';
import asita from '../assets/images/asita.png';
import won from '../assets/images/won.png';

const Cabang = () => {
    const [activeSlide, setActiveSlide] = useState(0); 
    const slides = [
        { src: servicesBg, alt: "Slide 1" },
        { src: "images/gallery-5.jpg", alt: "Slide 2" },
        { src: "images/gallery-6.jpg", alt: "Slide 3" },
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setActiveSlide(prevSlide => (prevSlide + 1) % slides.length);
        }, 7000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    return (
        <div className="cabang-page">
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
                        <h2>CABANG KAMI</h2>
                    </div>
                </div>
            </header>

            <section className="about-us-content">
                <div className="tentang-container">
                    <div className="offices-section">
                        <h2>Kantor Cabang</h2>
                        <div className="cabang-list">
                            <div className="cabang-item">
                                <h3>Cabang Sukabumi</h3>
                                <p>Jl. Raya Cisaat No. 1 kec. Cisaat Kab. Sukabumi, Sukabumi</p>
                                <p>Office: 0266 230 408 / 0859 3000 5544</p>
                                <p><strong>Instagram:</strong> barokahtour_sukabumi</p>
                                <p><strong>Tiktok:</strong> BAROKAH TOUR & TRAVEL</p>
                            </div>

                            <div className="cabang-item">
                                <h3>Cabang Yogyakarta</h3>
                                <p>Jl. Huntap Dongkelasri, Wukirsari Cangkringan, Yogyakarta</p>
                                <p>Office: 0822 2091 8815</p>
                                <p><strong>Instagram:</strong> barokahtourjogja</p>
                                <p><strong>Tiktok:</strong> Barokah Tour Jogja</p>
                            </div>

                            <div className="cabang-item">
                                <h3>Cabang Surabaya</h3>
                                <p>Jl. Jati Srono Timur 7/23 Kel. Ujung Kec. Semampir Kota Surabaya</p>
                                <p>Office: 0812 3033 5991</p>
                                <p><strong>Instagram:</strong> barokahtoursurabaya</p>
                            </div>

                            <div className="cabang-item">
                                <h3>Cabang Semarang</h3>
                                <p>Jl. Bukit Leyangan Damai, Gn. Pabongan, Leyangan, Kec. Ungaran Tim., Kabupaten Semarang</p>
                                <p>Office: 0812 3033 5991</p>
                                <p><strong>Instagram:</strong> barokah_toursemerang</p>
                            </div>
                        </div>
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

export default Cabang;


