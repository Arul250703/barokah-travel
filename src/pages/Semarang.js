import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/semarang.css';

// Import Aset Gambar (Pastikan path sesuai)
import servicesBg from '../assets/images/services-bg.jpg';
import videoSection from '../assets/videos/video-section.mp4';
import songo from '../assets/images/songo.jpeg';
import dusun from '../assets/images/dusun.jpeg';
import pink from '../assets/images/pink.jpeg';
import gili from '../assets/images/gili.jpeg';
import museum from '../assets/images/museum ambarawa.jpeg';
import goa from '../assets/images/Goa Kreo.jpeg';


// Data statis untuk semua paket wisata Semarang
const semarangData = {
    title: "PAKET WISATA SEMARANG",
    description: "Jelajahi keindahan kota lumpia",
    bgImage: servicesBg,
    packages: [
        { id: "1", name: "2H1M TRIP SEMARANG 1", subtitle: "Tour Museum Ambarawa - Saloka Theme Park - Sam Poo Kong", price: "IDR 1.163.000", minPax: "min. 4-5pax", image: songo, group: "paket-wisata" },
        { id: "2", name: "2H1M TRIP SEMARANG 2", subtitle: "Dusun Semilir - Candi Gedong Songo - Kota Lama Semarang", price: "IDR 1.163.000", minPax: "min. 4-5pax", image: dusun, group: "paket-wisata" },
        { id: "5", name: "WISATA LABUAN BAJO 3H2M", subtitle: "Pulau Kelor - Pulau Manjarite - Pulau Kalong - Pulau Padar - Pink Beach - Pulau Komodo - Taka Makassar - Manta Point - Pulau Siaba", price: "IDR 3.650.000", minPax: "min. 2-55pax", image: pink, group: "overland" },
        { id: "6", name: "PAKET B : LOMBOK ONE DAY", subtitle: "Gili Trawangan, Gili Air dan Gili Meno - Senggigi dan Kota Mataram - Pelabuhan Teluk Nare/Kecinan - Bukit Malimbu dan Destinasi Menarik lainnya", price: "IDR 460.000", minPax: "min. 2-10pax", image: gili, group: "one-day-trip" }
    ]
};

// Data statis untuk paket event/acara di Semarang
const semarangEventData = {
    capacityBuilding: [
        { id: "cb1", name: "Paket Standar", duration: "60-90 Menit", price: "IDR. 50.000/pax", details: ["3x Ice Breaking", "3x Fun Game", "Air Mineral 600ml", "Snack", "Sound Standard"] },
        { id: "cb2", name: "Paket Premium", duration: "60-120 Menit", price: "IDR. 100.000/pax", details: ["3x Ice Breaking", "5x Fun Game", "Game Kelompok", "Snack + Refreshment", "Air Mineral 600ml", "Sound Standard"] },
        { id: "cb3", name: "Paket Standar", duration: "60-90 Menit", price: "IDR. 150.000/pax", details: ["3x Ice Breaking", "3x Fun Game", "Game Kelompok", "1x Makan", "Snack", "Sound Standard"] }
    ],
    eoWo: [
        { id: "eo1", name: "SILVER PACKAGE", price: "IDR. 25.000.000/hari", details: ["Backsound (mp3, audio)", "MC + Tim EO (2 orang)", "Dekorasi panggung standar", "Lampu & Spotlight", "Lighting & Sound", "Dokumentasi Video & Foto"] },
        { id: "eo2", name: "GOLD PACKAGE", price: "IDR. 35.000.000/hari", details: ["Backsound (mp3, audio)", "MC + Tim EO (4 orang)", "Dekorasi panggung medium", "Lampu & Spotlight", "Lighting & Sound", "Dokumentasi Video & Foto", "Drone"] },
        { id: "eo3", name: "PLATINUM PACKAGE", price: "IDR. 65.000.000/hari", details: ["Backsound (mp3, audio)", "MC + Tim EO (6 orang)", "Dekorasi panggung full", "Lampu & Spotlight", "Lighting & Sound", "Dokumentasi Video & Foto", "Drone", "Live Streaming", "Undangan digital & hall full AC"] }
    ]
};

// Fungsi untuk mem-parsing harga dari string menjadi integer
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^\d,]/g, '').replace(',', '');
    return parseInt(cleaned, 10) || 0;
}


const Semarang = () => {
    const [currentFilter, setCurrentFilter] = useState('all');
    
    // Logika filter untuk menentukan paket yang akan ditampilkan
    let filteredPackages = [];
    if (currentFilter === 'paket') {
        filteredPackages = [...semarangEventData.capacityBuilding, ...semarangEventData.eoWo];
    } else {
        filteredPackages = semarangData.packages.filter(pkg => currentFilter === 'all' || pkg.group === currentFilter);
    }

    const heroBgStyle = {
        backgroundImage: `url(${semarangData.bgImage})`
    };

    return (
        <div className="semarang-page">
<<<<<<< HEAD
=======

>>>>>>> 135d61e4a803ed72ded8f27c2a9670999496fe85
            <header className="detail-hero-section" style={heroBgStyle}>
                <div className="detail-hero-overlay">
                    <h1 className="detail-hero-title">{semarangData.title}</h1>
                    <p className="detail-hero-subtitle">{semarangData.description}</p>
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
                    {currentFilter === 'paket' ? (
                        <div>
                            <section className="section">
                                <div className="section-title yellow-bg">CAPACITY BUILDING PACKAGE</div>
                                <div className="package-grid">
                                    {semarangEventData.capacityBuilding.map(pkg => (
                                        <div className="package-box" key={pkg.id}>
                                            <h4 className="gold">{pkg.name}<br/>{pkg.duration}</h4>
                                            <div className="price">{pkg.price}</div>
                                            <ul>
                                                {pkg.details.map((detail, index) => <li key={index}>{detail}</li>)}
                                            </ul>
                                            <Link 
                                                to="/pembayaran" 
                                                state={{
                                                    namaPaket: pkg.name,
                                                    harga: parsePrice(pkg.price),
                                                }}
                                                className="detail-btn"
                                            >
                                                Pesan Sekarang
                                            </Link>
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
                                    {semarangEventData.eoWo.map(pkg => (
                                        <div className="package-box" key={pkg.id}>
                                            <h4 className="silver">{pkg.name}</h4>
                                            <div className="price">{pkg.price}</div>
                                            <ul>
                                                {pkg.details.map((detail, index) => <li key={index}>{detail}</li>)}
                                            </ul>
                                            <Link 
                                                to="/pembayaran"
                                                state={{
                                                    namaPaket: pkg.name,
                                                    harga: parsePrice(pkg.price),
                                                }}
                                                className="detail-btn"
                                            >
                                                Pesan Sekarang
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                                <p className="note">
                                    • Harga untuk <b>Durasi 1 Hari</b><br/>
                                    • Harga area kota Semarang (lebih dari 25 km charges: 25% - 40%, tergantung lokasi)<br/>
                                    • Free crew + konsumsi crew, tiket objek wisata, org mineral, P3K Standar, Asuransi peserta, driver guide<br/>
                                    • Pembayaran melalui rekening bank mandiri : <b>1820001975030 AN PT BINA BAROKAH SEJAHTERA</b>
                                </p>
                            </section>
                        </div>
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
                                            to="/pembayaran"
                                            state={{
                                                namaPaket: pkg.name,
                                                harga: parsePrice(pkg.price),
                                            }}
                                            className="detail-btn"
                                        >
                                            Pesan Sekarang
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
                        <a href={`https://wa.me/6285930005544?text=Halo, saya tertarik dengan paket di Semarang.`} className="cta-button" target="_blank" rel="noopener noreferrer">Chat Kami Sekarang</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Semarang;