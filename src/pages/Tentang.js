import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/tentang.css';

// Import Aset Gambar dan Video (Pastikan path sesuai dengan struktur folder Anda)
import servicesBg from '../assets/images/services-bg.jpg';
import videoSection from '../assets/videos/video-section.mp4';
import telp from '../assets/images/telp.png';
import tameng from '../assets/images/tameng.jpeg';
import kop from '../assets/images/kop.jpeg';
import mandiri from '../assets/images/mandiri.png';
import bca from '../assets/images/bca.png';
import bni from '../assets/images/bni.png';
import asita from '../assets/images/asita.png';
import won from '../assets/images/won.png';

const Tentang = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        { type: 'image', src: servicesBg },
        // Anda bisa menambahkan slide lain di sini
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length);
        }, 7000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);
    
    return (
        <div className="tentang-page">
            <header className="hero-section">
                <div className="header-slider">
                    <div className="slider">
                        {slides.map((slide, index) => (
                            <img 
                                key={index} 
                                src={slide.src} 
                                className={index === currentSlide ? 'active' : ''} 
                                alt={`Slide ${index + 1}`} 
                            />
                        ))}
                    </div>
                    <div className="header-overlay">
                        <h1>TENTANG KAMI</h1>
                    </div>
                </div>
            </header>

            <section className="about-us-content">
                <div className="about-container">
                    <p>Barokah tour & travel adalah Perusahaan layanan jasa pariwisata dan Event organizer yang berada dibawah naungan PT. Bina Barokah Sejahtera.</p>
                    <ul className="legalitas-list">
                        <li><span>Penanggung Jawab</span> : Rizal Bahtiar Alhasani, S.Psi.</li>
                        <li><span>Akta Notaris</span> : AHU-0045694. AH. 01. 012018</li>
                        <li><span>SIUP</span> : 8120004912783</li>
                        <li><span>ASITA</span> : 074/IX/DPP/2018</li>
                    </ul>
                    <p>
                        Kami menyediakan Paket Umrah & Haji Plus, Wisata Religi, Tiket Pesawat, Penginapan Syariah, dan Transportasi Nyaman dengan harga yang kompetitif.
                    </p>
                </div>
            </section>
            
            <section className="offices-section">
                <h2>Kantor</h2>
                <div className="cabang-list">
                    <div className="cabang-item">
                        <h3>Cabang Sukabumi</h3>
                        <p>Jl. Raya Cisaat No. 1 kec. Cisaat Kab. Sukabumi, Sukabumi</p>
                        <p>Office: 0266 230 408 / 0859 3000 5544</p>
                        <p><strong>Instagram:</strong> barokahtour_sukabumi</p>
                        <p><strong>Tiktok:</strong> Barokah Tour & Travel</p>
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

export default Tentang;
