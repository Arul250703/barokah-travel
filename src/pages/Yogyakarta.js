import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
// import '../components/styles/Yogyakarta.css';
=======
import '../components/styles/yogyakarta.css';
>>>>>>> d4e991a1d61388a3738c638dcef36b0d0fef631f

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

// Data statis untuk semua paket wisata Yogyakarta
const yogyakartaData = {
    title: "Paket Wisata Yogyakarta",
    description: "Daerah Istimewa Yogyakarta",
    bgImage: yogya,
    packages: [
        { id: "1", name: "PAKET A : YOGYAKARTA 2H1M", subtitle: "Hutan Pinus Mangunan - Explore Gumuk Pasir & Pantai Parangtritis by Jeep - Obelix Sea View - Candi Prambanan - Tamansari Water castle", price: "IDR 992.000", minPax: "min. 2-15pax", image: pinus, group: "paket-wisata" },
        { id: "2", name: "PAKET B : YOGYAKARTA 2H1M", subtitle: "Pantai Drini - Cave Tubing Goa Pindul - Heha Sky View - Kraton Kasultanan Ngayogyokarto - Gamplong Studio", price: "IDR 874.000", minPax: "min. 2-15pax", image: yogya, group: "paket-wisata" },
        { id: "3", name: "PAKET C : YOGYAKARTA 2H1M", subtitle: "VW Safari Borobudur - Museum Ulen Sentalu - Heha Sky View - Candi Prambanan - Museum Art Jogja", price: "IDR 1.027.000", minPax: "min. 2-15pax", image: bro, group: "paket-wisata" },
        { id: "4", name: "PAKET D : YOGYAKARTA 2H1M", subtitle: "Lava Tour Merapi by Jeep Adventure - Candi Prambanan - Obelix Hill - Museum Art Jogja - Tamansari Water Castle", price: "IDR 1.016.000", minPax: "min. 2-15pax", image: pram, group: "paket-wisata" },
        { id: "5", name: "PAKET A : YOGYAKARTA 3H2M", subtitle: "Pantai Drini - Cave Tubing Goa Pindul - Heha Sky View - Hutan Pinus Mangunan - Explore Gumuk Pasir by Jeep Adventure - Obelix Sea View - Candi Prambanan Wisata Belanja Oleh-Oleh", price: "IDR 1.444.000", minPax: "min. 2-15pax", image: jeram, group: "paket-wisata" },
        { id: "6", name: "PAKET WISATA YOGYAKARTA 4H3M", subtitle: "Candi Borobudur - Umbul Banyu Roso - VW Safari Borobudur - Puncak Sosok Jogja - Seribu Batu Songgo Langit - Hutan Pinus Becici - Heha Sky View - Pantai Indrayanti - Bukit Bintang - Bhumi Merapi - Lava Tour Jeep Merapi - Candi Prambanan - Kraton Yogyakarta - Tamansari - Tebing Breksi - Malioboro", price: "IDR 1.928.000", minPax: "min. 2-30pax", image: rj, group: "paket-wisata" },
        { id: "7", name: "PAKET A : YOGYAKARTA ONE DAY", subtitle: "Kraton Kasultanan Ngayogyokarto - Tamansari Water Castle - Museum Sonobudoyo - Museum Art Jogja", price: "IDR 396.000", minPax: "min. 2-15pax", image: yogya, group: "one-day-trip" },
        { id: "8", name: "PAKET B : YOGYAKARTA ONE DAY", subtitle: "Candi Borobudur - Candi Prambanan - Candi Ratu Boko - Tebing Breksi", price: "IDR 478.000", minPax: "min. 2-15pax", image: bro, group: "one-day-trip" },
        { id: "9", name: "PAKET C : YOGYAKARTA ONE DAY", subtitle: "Hutan Pinus Mangunan - Seribu Batu Songgo Langit - Explore Gumuk Pasir by Jeep Adventure - Obelix Sea View", price: "IDR 497.000", minPax: "min. 2-15pax", image: pinus, group: "one-day-trip" },
        { id: "10", name: "PAKET D : YOGYAKARTA ONE DAY", subtitle: "Lava Tour Merapi by Jeep Adventure - Tebing Breksi - Obelix Hill - Candi Prambanan", price: "IDR 525.000", minPax: "min. 2-15pax", image: pram, group: "one-day-trip" },
        { id: "11", name: "PAKET E : YOGYAKARTA ONE DAY", subtitle: "Pantai Timang Shuttle by Jeep - Cave Tubing Goa Pindul - Heha Sky View", price: "IDR 538.000", minPax: "min. 2-15pax", image: rj, group: "one-day-trip" },
        { id: "12", name: "Paket Tour Bali 2H1M", subtitle: "Tanah Lot - Pantai Dreamland - Pantai Jimbaran - Tanjung Benoa - Krisna Shoping Center", price: "IDR 837.000", minPax: "min. 2–55pax", image: dreamland, group: "overland" },
        { id: "13", name: "Paket Tour Bali 3H2M", subtitle: "Pure Ulun Danu Bedugul -  Blossom Garden -  Tanah Lot - Tanjung Benoa - Pura Luhur Uluwatu - Pantai Melasti - Pantai Jimbaran - Pantai Kuta - Krisna Shoping Center", price: "IDR 1.260.000", minPax: "min. 2–50pax", image: lot, group: "overland" },
        { id: "14", name: "Paket Tour Bali 4H3M", subtitle: "Kintamani - Tirta Empul - Gusto Gelato -  Blossom Garden -  Pura Ulun Danu Bedugul -  Tanah Lot - Tanjung Benoa - GWK - Pantai Melasti -  Pantai Jimbaran - Pantai Kute - Krisna Shoping Center", price: "IDR 1.891.000", minPax: "min. 2–55pax", image: dreamland, group: "overland" },
    ],
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

const Yogyakarta = () => {
    const [currentFilter, setCurrentFilter] = useState('all');
    
    // Logika filter untuk menentukan paket yang akan ditampilkan
    let filteredPackages = [];
    let isEventPackage = false;
    
    // PERBAIKAN: Gabungkan semua paket wisata, one-day trip, dan overland
    const allWisataPackages = [...yogyakartaData.packages];

    if (currentFilter === 'paket') {
        filteredPackages = [...eventData.capacityBuilding, ...eventData.eoWo];
        isEventPackage = true;
    } else {
        filteredPackages = allWisataPackages.filter(pkg => currentFilter === 'all' || pkg.group === currentFilter);
    }
        
    const heroBgStyle = {
        backgroundImage: `url(${yogyakartaData.bgImage})`
    };

    return (
        <div className="yogyakarta-page">
            <header className="detail-hero-section" style={heroBgStyle}>
                <div className="detail-hero-overlay">
                    <h1 className="detail-hero-title">{yogyakartaData.title}</h1>
                    <p className="detail-hero-subtitle">{yogyakartaData.description}</p>
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
                                            to={`/detail/yogyakarta/${pkg.id}`}
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
                        <a href={`https://wa.me/6285930005544?text=Halo, saya tertarik dengan paket di Yogyakarta.`} className="cta-button" target="_blank" rel="noopener noreferrer">Chat Kami Sekarang</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Yogyakarta;
