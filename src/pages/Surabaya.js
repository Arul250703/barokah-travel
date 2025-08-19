import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/surabaya.css';

// Import Aset Gambar yang relevan untuk halaman ini
import situ from '../assets/images/situ.jpeg';
import plara from '../assets/images/plara.jpeg';
import dreamland from '../assets/images/dreamland.jpeg';
import lot from '../assets/images/lot.jpeg';
import jeram from '../assets/images/jeram.jpeg';
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
import bali from '../assets/images/bali.jpeg';
import museum from '../assets/images/museum ambarawa.jpeg';
import goa from '../assets/images/Goa Kreo.jpeg';
import videoSection from '../assets/videos/video-section.mp4';
import servicesBg from '../assets/images/services-bg.jpg';

// Data statis untuk semua paket wisata Surabaya
const surabayaData = {
    title: "Paket Wisata Surabaya",
    description: "Jawa Timur",
    bgImage: servicesBg,
    packages: [
        { 
            id: "1", 
            name: "PAKET WISATA SURABAYA 3H2M", 
            subtitle: "Monumen Kapal Selam - Kebun Binatang Surabaya - Tunjungan Plaza - Jembatan Suramadu - Monumen Tugu Pahlawan - Pasar Turi", 
            price: "IDR 823.000", 
            minPax: "min. 2–10pax", 
            image: servicesBg, 
            group: "paket-wisata"
        },
        { 
            id: "2", 
            name: "PAKET A : SURABAYA ONE DAY", 
            subtitle: "Taman Bungkul - House of Sampoerna - Monumen Kapal Selam - Jembatan Suramadu", 
            price: "IDR 520.000", 
            minPax: "min. 2-10pax", 
            image: bali, 
            group: "one-day-trip" 
        },
        { 
            id: "3", 
            name: "PAKET B : SURABAYA ONE DAY", 
            subtitle: "Kebun Binatang Surabaya - Masjid Al Akbar - Tunjungan Plaza - Pasar Atom", 
            price: "IDR 530.000", 
            minPax: "min. 2-10pax", 
            image: bali, 
            group: "one-day-trip" 
        },
        { 
            id: "4", 
            name: "Paket Tour Bali 2H1M", 
            subtitle: "Tanah Lot - Pantai Dreamland - Pantai Jimbaran - Tanjung Benoa - Krisna Shoping Center", 
            price: "IDR 837.000", 
            minPax: "min. 2–55pax", 
            image: dreamland, 
            group: "overland" 
        },
        { 
            id: "5", 
            name: "Paket Tour Bali 3H2M", 
            subtitle: "Pure Ulun Danu Bedugul - Blossom Garden - Tanah Lot - Tanjung Benoa - Pura Luhur Uluwatu - Pantai Melasti - Pantai Jimbaran - Pantai Kuta - Krisna Shoping Center", 
            price: "IDR 1.260.000", 
            minPax: "min. 2–50pax", 
            image: lot, 
            group: "overland" 
        },
        { 
            id: "6", 
            name: "Paket Tour Bali 4H3M", 
            subtitle: "Kintamani - Tirta Empul - Gusto Gelato - Blossom Garden - Pura Ulun Danu Bedugul - Tanah Lot - Tanjung Benoa - GWK - Pantai Melasti - Pantai Jimbaran - Pantai Kute - Krisna Shoping Center", 
            price: "IDR 1.891.000", 
            minPax: "min. 2–55pax", 
            image: dreamland, 
            group: "overland" 
        }
    ]
};

const eventData = {
    capacityBuilding: [
        { id: "cb1", name: "Paket Standar", duration: "60-90 Menit", price: "IDR. 50.000/pax", details: ["3x Ice Breaking", "3x Fun Game", "Air Mineral 600ml", "Snack", "Sound Standard"], group: "paket" },
        { id: "cb2", name: "Paket Premium", duration: "60-120 Menit", price: "IDR. 100.000/pax", details: ["3x Ice Breaking", "5x Fun Game", "Game Kelompok", "Snack + Refreshment", "Air Mineral 600ml", "Sound Standard"], group: "paket" },
        { id: "cb3", name: "Paket Standar", duration: "60-90 Menit", price: "IDR. 150.000/pax", details: ["3x Ice Breaking", "3x Fun Game", "Game Kelompok", "1x Makan", "Snack", "Sound Standard"], group: "paket" }
    ],
    eoWo: [
        { id: "eo1", name: "SILVER PACKAGE", price: "IDR. 25.000.000/hari", details: ["Backsound (mp3, audio)", "MC + Tim EO (2 orang)", "Dekorasi panggung standar", "Lampu & Spotlight", "Lighting & Sound", "Dokumentasi Video & Foto"], group: "paket" },
        { id: "eo2", name: "GOLD PACKAGE", price: "IDR. 35.000.000/hari", details: ["Backsound (mp3, audio)", "MC + Tim EO (4 orang)", "Dekorasi panggung medium", "Lampu & Spotlight", "Lighting & Sound", "Dokumentasi Video & Foto", "Drone"], group: "paket" },
        { id: "eo3", name: "PLATINUM PACKAGE", price: "IDR. 65.000.000/hari", details: ["Backsound (mp3, audio)", "MC + Tim EO (6 orang)", "Dekorasi panggung full", "Lampu & Spotlight", "Lighting & Sound", "Dokumentasi Video & Foto", "Drone", "Live Streaming", "Undangan digital & hall full AC"], group: "paket" }
    ]
};

const Surabaya = () => {
    const [currentFilter, setCurrentFilter] = useState('all');
    
    // Logika filter untuk menentukan paket yang akan ditampilkan
    let filteredPackages = [];
    let isEventPackage = false;
    
    const allWisataPackages = [...surabayaData.packages];

    if (currentFilter === 'paket') {
        filteredPackages = [...eventData.capacityBuilding, ...eventData.eoWo];
        isEventPackage = true;
    } else {
        filteredPackages = allWisataPackages.filter(pkg => currentFilter === 'all' || pkg.group === currentFilter);
    }
        
    const heroBgStyle = {
        backgroundImage: `url(${surabayaData.bgImage})`
    };

    return (
        <div className="surabaya-page">
            <header className="detail-hero-section" style={heroBgStyle}>
                <div className="detail-hero-overlay">
                    <h1 className="detail-hero-title">{surabayaData.title}</h1>
                    <p className="detail-hero-subtitle">{surabayaData.description}</p>
                </div>
            </header>

            <section id="destination-menu" className="destination-menu-section">
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('all')}
                    >
                        Semua
                    </button>
                    <button 
                        className={`filter-btn ${currentFilter === 'paket-wisata' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('paket-wisata')}
                    >
                        Paket Wisata
                    </button>
                    <button 
                        className={`filter-btn ${currentFilter === 'overland' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('overland')}
                    >
                        Overland | UMUM
                    </button>
                    <button 
                        className={`filter-btn ${currentFilter === 'one-day-trip' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('one-day-trip')}
                    >
                        One Day Trip
                    </button>
                    <button 
                        className={`filter-btn ${currentFilter === 'paket' ? 'active' : ''}`}
                        onClick={() => setCurrentFilter('paket')}
                    >
                        Paket
                    </button>
                </div>
                
                <div className="destination-groups">
                    {isEventPackage ? (
                        <>
                            <section className="section">
                                <div className="section-title yellow-bg">CAPACITY BUILDING PACKAGE</div>
                                <div className="package-grid">
                                    {eventData.capacityBuilding.map(pkg => (
                                        <div className="package-box" key={pkg.id}>
                                            <h4 className="gold">{pkg.name}<br/>{pkg.duration}</h4>
                                            <div className="price">{pkg.price}</div>
                                            <ul>
                                                {pkg.details.map((detail, index) => <li key={index}>{detail}</li>)}
                                            </ul>
                                            <a 
                                                href={`https://wa.me/6285930005544?text=Halo, saya tertarik dengan paket ${pkg.name}.`} 
                                                className="detail-btn"
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                Pesan Sekarang
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                <p className="note">
                                    • Harga paket untuk <b>Minimal Order 20 Orang</b><br/>
                                    • Untuk Reservasi paket lebih dari 20 orang konfirmasi kepada admin barokah tour & travel<br/>
                                    • Pembayaran melalui rekening bank mandiri : <b>1820001975030 AN PT BINA BAROKAH SEJAHTERA</b>
                                </p>
                            </section>
                            <section className="section">
                                <div className="section-title yellow-bg">EVENT PACKAGE : EO/WO/DLL</div>
                                <div className="package-grid">
                                    {eventData.eoWo.map(pkg => (
                                        <div className="package-box" key={pkg.id}>
                                            <h4 className="silver">{pkg.name}</h4>
                                            <div className="price">{pkg.price}</div>
                                            <ul>
                                                {pkg.details.map((detail, index) => <li key={index}>{detail}</li>)}
                                            </ul>
                                            <a 
                                                href={`https://wa.me/6285930005544?text=Halo, saya tertarik dengan paket ${pkg.name}.`} 
                                                className="detail-btn"
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                Pesan Sekarang
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                <p className="note">
                                    • Harga untuk <b>Durasi 1 Hari</b><br/>
                                    • Harga area kota Sukabumi (lebih dari 25 km charges: 25% - 40%, tergantung lokasi)<br/>
                                    • Free crew + konsumsi crew, tiket objek wisata, org mineral, P3K Standar, Asuransi peserta, driver guide<br/>
                                    • Pembayaran melalui rekening bank mandiri : <b>1820001975030 AN PT BINA BAROKAH SEJAHTERA</b>
                                </p>
                            </section>
                        </>
                    ) : (
                        <div className="tour-cards-grid">
                            {filteredPackages.map(pkg => (
                                <div className="paket-card" key={pkg.id}>
                                    <img src={pkg.image} alt={pkg.name} />
                                    <div className="paket-info">
                                        <h3>{pkg.name}</h3>
                                        <p className="subjudul">{pkg.subtitle}</p>
                                        <p className="harga">{pkg.price} <span className="min">{pkg.minPax}</span></p>
                                        <Link 
                                            to={`/detail/surabaya/${pkg.id}`}
                                            className="detail-btn"
                                        >
                                            Lihat Detail
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            
            <section className="custom-cta">
                <video autoPlay muted loop playsInline className="cta-video" src={videoSection} />
                <div className="cta-overlay">
                    <div className="cta-text">
                        <h2>Belum menemukan paket yang sesuai?</h2>
                        <p>Kami siap bantu merancang perjalanan khusus sesuai kebutuhan dan anggaran Anda!</p>
                        <a href={`https://wa.me/6285930005544?text=Halo, saya tertarik dengan paket di Surabaya.`} className="cta-button" target="_blank" rel="noopener noreferrer">Chat Kami Sekarang</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Surabaya;
