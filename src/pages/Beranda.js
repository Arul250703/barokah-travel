import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/Beranda.css';

// Import Aset Gambar dan Video (Pastikan path sesuai dengan struktur folder Anda)
import Logo from '../assets/images/Logo.png';
import videoSection from '../assets/videos/video-section.mp4';
import biru from '../assets/images/biru.jpeg';
import gunung from '../assets/images/gunung.jpeg';
import bali from '../assets/images/bali.jpeg';
import jeram from '../assets/images/jeram.jpeg';
import situ from '../assets/images/situ.jpeg';
import pantaiBali from '../assets/images/pantai-bali.jpeg';
import servicesBg from '../assets/images/services-bg.jpg';
import plara from '../assets/images/plara.jpeg';
import dreamland from '../assets/images/dreamland.jpeg';
import lot from '../assets/images/lot.jpeg';
import rj from '../assets/images/rj.jpeg';
import pinus from '../assets/images/pinus.jpeg';
import yogya from '../assets/images/yogya.jpeg';
import bro from '../assets/images/bro.jpeg';
import pram from '../assets/images/pram.jpeg';
import tanjung from '../assets/images/tanjung.jpeg';
import songo from '../assets/images/songo.jpeg';
import dusun from '../assets/images/dusun.jpeg';
import pink from '../assets/images/pink.jpeg';
import gili from '../assets/images/gili.jpeg';
import mandiri from '../assets/images/mandiri.png';
import bca from '../assets/images/bca.png';
import bni from '../assets/images/bni.png';
import asita from '../assets/images/asita.png';
import won from '../assets/images/won.png';
import telp from '../assets/images/telp.png';
import tameng from '../assets/images/tameng.jpeg';
import kop from '../assets/images/kop.jpeg';

const Beranda = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        { type: 'video', src: videoSection, link: 'PROMO 1.html' },
        { type: 'image', src: biru, link: 'PROMO 2.html' },
        { type: 'image', src: gunung, link: 'PROMO 3.html' },
        { type: 'image', src: bali, link: 'PROMO 4.html' },
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length);
        }, 7000);
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    return (
        <div className="beranda-content">
            <header className="hero-section">
                <div className="slideshow-container">
                    {slides.map((slide, index) => (
                        <a href={slide.link} key={index} className={`bg-slide ${index === currentSlide ? 'active' : ''}`}>
                            {slide.type === 'video' ? (
                                <video src={slide.src} autoPlay muted loop playsInline />
                            ) : (
                                <img src={slide.src} alt={`Slide ${index + 1}`} />
                            )}
                        </a>
                    ))}
                    <div className="slideshow-dots">
                        {slides.map((_, index) => (
                            <span 
                                key={index} 
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            ></span>
                        ))}
                    </div>
                </div>
            </header>

            <div className="tour-services-wrapper">
                <div className="tour-icons-container">
                    <a href="" className="tour-icon-item">
                        <div className="icon-circle">
                            <img src={jeram} alt="Paket Wisata" className="icon-image" />
                        </div>
                        <h3 className="icon-title">Paket Tour</h3>
                    </a>
                    <a href="" className="tour-icon-item">
                        <div className="icon-circle">
                            <img src={situ} alt="One Day Trip" className="icon-image" />
                        </div>
                        <h3 className="icon-title">One Day Trip</h3>
                    </a>
                    <a href="" className="tour-icon-item">
                        <div className="icon-circle">
                            <img src={pantaiBali} alt="Overland Umum" className="icon-image" />
                        </div>
                        <h3 className="icon-title">Overland Umum</h3>
                    </a>
                    <a href="" className="tour-icon-item">
                        <div className="icon-circle">
                            <img src={servicesBg} alt="Event Organizer" className="icon-image" />
                        </div>
                        <h3 className="icon-title">Event Organizer</h3>
                    </a>
                </div>
            </div>

            <section className="tour-cards-section">
                <h3 className="tour-section-title">
                    PAKET WISATA SUKABUMI
                    <Link to="/Yogyakartta" className="lihat-semua-link">Lihat Semua</Link>
                </h3>
                <div className="scroll-container">
                    <div className="tour-card">
                        <img src={situ} alt="Situ Gunung" />
                        <div className="card-body">
                            <h4>Situ Gunung-Heritage Kota Sukabumi 2H1M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 695.000</strong>
                            </div>
                            <Link to="/sukabumi" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={plara} alt="Pelabuhan Ratu Situ Gunung" />
                         <div className="card-body">
                            <h4>Pelabuhan Ratu Situ Gunung 2H1M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 790.000</strong>
                            </div>
                            <Link to="/Pelabuan" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={dreamland} alt="Tour Bali" />
                        <div className="card-body">
                            <h4>Tour Bali 2H1M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 837.000</strong>
                            </div>
                            <Link to="/sukabumi" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={lot} alt="Honeymoon Bali" />
                        <div className="card-body">
                            <h4>Honeymoon Bali 3H2M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.891.000</strong>
                            </div>
                            <Link to="/SURABAYA" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={jeram} alt="Taman Safari" />
                        <div className="card-body">
                            <h4>Taman Safari</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 415.000</strong>
                            </div>
                            <Link to="/sukabumi" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={rj} alt="Taman Bunga" />
                        <div className="card-body">
                            <h4>Taman Bunga</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 235.000</strong>
                            </div>
                            <Link to="/sukabumi" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tour-cards-section">
                <h3 className="tour-section-title">
                    PAKET WISATA YOGYAKARTA
                    <Link to="/yogyakarta" className="lihat-semua-link">Lihat Semua</Link>
                </h3>
                <div className="scroll-container">
                    <div className="tour-card">
                        <img src={pinus} alt="Paket A Yogyakarta" />
                        <div className="card-body">
                            <h4>PAKET A : YOGYAKARTA 2H1M </h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 992.000</strong>
                            </div>
                            <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={yogya} alt="Paket B Yogyakarta" />
                        <div className="card-body">
                            <h4>PAKET B : YOGYAKARTA 2H1M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 874.000</strong>
                            </div>
                            <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={bro} alt="Paket C Yogyakarta" />
                        <div className="card-body">
                            <h4>PAKET C : YOGYAKARTA 2H1M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.027.000</strong>
                            </div>
                            <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={pram} alt="Paket D Yogyakarta" />
                        <div className="card-body">
                            <h4>PAKET D : YOGYAKARTA 2H1M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.016.000</strong>
                            </div>
                            <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={jeram} alt="Paket A Yogyakarta 3H2M" />
                        <div className="card-body">
                            <h4>PAKET A : YOGYAKARTA 3H2M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.444.000</strong>
                            </div>
                            <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={rj} alt="Yogyakarta 4H3M" />
                        <div className="card-body">
                            <h4>WISATA YOGYAKART 4H3M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.928.000</strong>
                            </div>
                            <Link to="/yogyakarta" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tour-cards-section">
                <h3 className="tour-section-title">
                    PAKET WISATA SURABAYA
                    <Link to="/surabaya" className="lihat-semua-link">Lihat Semua</Link>
                </h3>
                <div className="scroll-container">
                    <div className="tour-card">
                        <img src={bali} alt="Tour Bali 2H1M" />
                        <div className="card-body">
                            <h4>Tour Bali 2H1M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 837.000 </strong>
                            </div>
                            <Link to="/surabaya" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={bali} alt="Tour Bali 3H2M" />
                        <div className="card-body">
                            <h4>Tour Bali 3H2M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.260.000</strong>
                            </div>
                            <Link to="/surabaya" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={dreamland} alt="Tour Bali 4H3M" />
                        <div className="card-body">
                            <h4>Tour Bali 4H3M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.891.000</strong>
                            </div>
                            <Link to="/surabaya" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={tanjung} alt="Wisata Karimunjawa" />
                        <div className="card-body">
                            <h4>Wisata Karimunjawa 2H1M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 670.000 </strong>
                            </div>
                            <Link to="/surabaya" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tour-cards-section">
                <h3 className="tour-section-title">
                    PAKET WISATA SEMARANG
                    <Link to="/semarang" className="lihat-semua-link">Lihat Semua</Link>
                </h3>
                <div className="scroll-container">
                    <div className="tour-card">
                        <img src={songo} alt="TRIP SEMARANG 1" />
                        <div className="card-body">
                            <h4>2H1M TRIP SEMARANG 1</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.163.000</strong>
                            </div>
                            <Link to="/semarang" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={dusun} alt="TRIP SEMARANG 2" />
                        <div className="card-body">
                            <h4>2H1M TRIP SEMARANG 2</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 1.163.000</strong>
                            </div>
                            <Link to="/semarang" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={pink} alt="WISATA LABUAN BAJO" />
                        <div className="card-body">
                            <h4>WISATA LABUAN BAJO 3H2M</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 3.650.000</strong>
                            </div>
                            <Link to="/semarang" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                    <div className="tour-card">
                        <img src={gili} alt="PAKET B : LOMBOK" />
                        <div className="card-body">
                            <h4>PAKET B : LOMBOK ONE DAY</h4>
                            <div className="card-price">
                                <p className="price-label">Mulai dari</p>
                                <strong className="price-value">IDR 460.000</strong>
                            </div>
                            <Link to="/semarang" className="detail-button">Lihat Detail</Link>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="include-bar">
                <span>INCLUDE</span>
                BUS PARIWISATA | AIR MINERAL | DOORPRIZE | TRAVEL BOX | ASURANSI TIKET WISATA | P3K | TOL & PARKIR | BANNER | TOUR GUIDE | DOKUMENTASI
            </div>

            <section className="event-organizer-section">
                <h3 className="section-title">INFORMASI LAYANAN EVENT ORGANIZER</h3>
                <div className="package-buttons">
                    <Link to="/layanan" className="btn btn-primary">CAPACITY BUILDING PAKCAGE</Link>
                    <Link to="/layanan" className="btn btn-primary">EVENT PACKAGE : EO/WO/DLL</Link>
                </div>
            </section>
            
            <section className="why-us-section-event">
                <h2>Kenapa Harus Kami?</h2>
                <div className="why-us-cards-event">
                    <div className="why-us-card-event">
                        <img src={telp} alt="Icon Respon Cepat" />
                        <h3>Respon Cepat & Ramah</h3>
                        <p>Kami merespon kebutuhan pelanggan dengan cepat dan ramah. Tim customer service kami siap membantu Anda kapan pun dibutuhkan.</p>
                    </div>
                    <div className="why-us-card-event">
                        <img src={tameng} alt="Icon Terpercaya" />
                        <h3>Terpercaya & Berpengalaman</h3>
                        <p>Kami telah dipercaya oleh banyak pelanggan dan memiliki pengalaman dalam menangani berbagai jenis event dengan aman dan profesional.</p>
                    </div>
                    <div className="why-us-card-event">
                        <img src={kop} alt="Icon Trip" />
                        <h3>Perjalanan Terencana dengan Baik</h3>
                        <p>Setiap perjalanan disusun dengan baik, mulai dari jadwal, transportasi, logistik, hingga akomodasi, untuk memastikan kenyamanan Anda.</p>
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

export default Beranda;
