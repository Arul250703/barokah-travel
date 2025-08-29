import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../components/styles/Sukabumi.css";

// Import Aset Gambar dan Video
import situ from "../assets/images/situ.jpeg";
import plara from "../assets/images/plara.jpeg";
import dreamland from "../assets/images/dreamland.jpeg";
import lot from "../assets/images/lot.jpeg";
import bali from "../assets/images/bali.jpeg";
import tanjung from "../assets/images/tanjung.jpeg";
import pink from "../assets/images/pink.jpeg";
import gili from "../assets/images/gili.jpeg";
import videoSection from "../assets/videos/video-section.mp4"; // Pastikan path video ini benar

// Data statis untuk semua paket wisata
const sukabumiData = {
    title: "Paket Wisata Pilihan",
    description: "Jawa Barat & Destinasi Populer Lainnya",
    bgImage: situ,
    packages: [
        { id: "1", name: "Situ Gunung-Heritage Kota Sukabumi 2H1M", subtitle: "Tracking Situ Gunung - Museum Prabu Siliwangi", price: "IDR 695.000", minPax: "min. 4–5pax", image: situ, group: "paket-wisata" },
        { id: "2", name: "Pelabuhan Ratu Situ Gunung 2H1M", subtitle: "Pantai Citepus - Geyser Cisolok - Tracking Situ Gunung", price: "IDR 790.000", minPax: "min. 4–5pax", image: plara, group: "paket-wisata" },
        { id: "3", name: "Paket Tour Bali 2H1M", subtitle: "Tanah Lot - Pantai Dreamland - Pantai Jimbaran", price: "IDR 837.000", minPax: "min. 2–55pax", image: dreamland, group: "overland" },
        { id: "4", name: "Paket Tour Bali 3H2M", subtitle: "Pure Ulun Danu Bedugul - Tanah Lot - Pura Luhur Uluwatu", price: "IDR 1.260.000", minPax: "min. 2–50pax", image: lot, group: "overland" },
        { id: "5", name: "Paket Tour Bali 4H3M", subtitle: "Kintamani - Tirta Empul - Pura Ulun Danu Bedugul", price: "IDR 1.891.000", minPax: "min. 2–55pax", image: dreamland, group: "overland" },
        { id: "6", name: "Paket Honeymoon Bali 4H", subtitle: "Kintamani - Tirta Empul - GWK - Pantai Melasti", price: "IDR 1.891.000", minPax: "min. 2–55pax", image: bali, group: "overland" },
        { id: "7", name: "Paket Honeymoon Bali 3H2M", subtitle: "Jimbaran Seafood - Angel’s Billabong - Broken Beach", price: "IDR 1.891.000", minPax: "min. 2–55pax", image: bali, group: "overland" },
        { id: "8", name: "Paket Wisata Karimunjawa 2H1M", subtitle: "Spot snorkeling - Pantai tanjung gelam - Alun-alun", price: "IDR 670.000", minPax: "", image: tanjung, group: "overland" },
        { id: "9", name: "Paket Wisata Karimunjawa 3H2M", subtitle: "Bukit love - tanjung gelam - Spot nemo - Pulau cemara besar", price: "IDR 855.000", minPax: "", image: tanjung, group: "overland" },
        { id: "10", name: "Paket Wisata Karimunjawa 4H3M", subtitle: "Bukit love - tanjung gelam - Spot nemo - Pantai bobi - Pantai sunset", price: "IDR 1.050.000", minPax: "", image: tanjung, group: "overland" },
        { id: "11", name: "Paket Honeymoon Karimunjawa 2H1M", subtitle: "Bukit love - Pantai tanjung gelam - Alun-alun karimunjawa", price: "IDR 5.380.000/Couple", minPax: "", image: tanjung, group: "overland" },
        { id: "12", name: "Paket Honeymoon Karimunjawa 3H2M", subtitle: "Bukit love - tanjung gelam - Spot nemo - Pulau cemara besar", price: "IDR 6.350.000/Couple", minPax: "", image: tanjung, group: "overland" },
        { id: "13", name: "Paket Honeymoon Karimunjawa 4H3M", subtitle: "Bukit love - tanjung gelam - Spot nemo - Pantai bobi - Pantai sunset", price: "IDR 7.300.000/Couple", minPax: "", image: tanjung, group: "overland" },
        { id: "14", name: "PAKET WISATA LABUAN BAJO 3H2M", subtitle: "Pulau Kelor - Pulau Manjarite - Pulau Kalong - Pulau Padar - Pink Beach", price: "IDR 3.650.000", minPax: "", image: pink, group: "overland" },
        { id: "15", name: "PAKET WISATA LABUAN BAJO 4H3M", subtitle: "Pulau Kelor - Pulau Manjarite - Pulau Kalong - Pulau Padar - Pink Beach", price: "IDR 4.850.000", minPax: "", image: pink, group: "overland" },
        { id: "16", name: "PAKET HONEYMOON LABUAN BAJO", subtitle: "Pulau Kelor - Pulau Manjarite - Pulau Kalong - Pulau Padar - Pink Beach", price: "IDR 8.600.000", minPax: "", image: pink, group: "overland" },
        { id: "17", name: "PAKET A : LOMBOK ONE DAY (Snorkeling Gili Trawangan 1 Hari)", subtitle: "Gili Trawangan, Gili Air dan Gili Meno - Senggigi - Bukit Malimbu", price: "IDR 470.000", minPax: "min. 2–10pax", image: gili, group: "one-day-trip" },
        { id: "18", name: "PAKET B : LOMBOK ONE DAY ( Explore Gili Trawangan )", subtitle: "Gili Trawangan, Pass Pusuk ( Monkey Forest ) - Senggigi - Bukit Malimbu", price: "IDR 460.000", minPax: "min. 2–10pax", image: gili, group: "one-day-trip" },
        { id: "19", name: "Paket Tour Lombok 2 Hari 1 Malam (A)", subtitle: "Gili Trawangan - Kuta Mandalika - Pantai Tanjung Ann - Desa Suku Sasak", price: "IDR 780.000", minPax: "min. 2–10pax", image: gili, group: "paket-wisata" },
        { id: "20", name: "Paket Tour Lombok 2 Hari 1 Malam (B)", subtitle: "Pantai Pink - Gili Petelu - Kuta Mandalika - Desa Suku Sasak", price: "IDR 750.000", minPax: "min. 2–10pax", image: pink, group: "paket-wisata" },
        { id: "21", name: "Paket Tour Lombok 3 Hari 2 Malam (A)", subtitle: "Kuta Mandalika - Sirkuit Mandalika - Gili Trawangan - Bukit Malimbu", price: "IDR 910.000", minPax: "min. 2–10pax", image: gili, group: "paket-wisata" },
        { id: "22", name: "Paket Tour Lombok 3 Hari 2 Malam (B)", subtitle: "Kuta Mandalika - Sirkuit Mandalika - Pantai Pink - Gili Petelu", price: "IDR 870.000", minPax: "min. 2–10pax", image: pink, group: "paket-wisata" },
        { id: "23", name: "Paket Tour Lombok 4 Hari 3 Malam (A)", subtitle: "Kuta Mandalika - Gili Trawangan - Air Terjun Benang Stokel dan Kelambu", price: "IDR 1.220.000", minPax: "min. 2–10pax", image: gili, group: "paket-wisata" },
        { id: "24", name: "Paket Honeymoon Lombok 3H2M", subtitle: "Kuta Mandalika - Gili Trawangan - Bukit Malioboro, Senggigi", price: "IDR 4.000.000/Couple", minPax: "", image: gili, group: "paket-wisata" },
    ],
};

const eventData = {
    capacityBuilding: [
        { id: "cb1", name: "Paket Standar", duration: "60-90 Menit", price: "IDR 50.000", details: ["3x Ice Breaking", "3x Fun Game", "Air Mineral 600ml", "Snack"], },
        { id: "cb2", name: "Paket Premium", duration: "60-120 Menit", price: "IDR 100.000", details: ["3x Ice Breaking", "5x Fun Game", "Game Kelompok", "Snack + Refreshment",], },
        { id: "cb3", name: "Paket Standar Plus", duration: "60-90 Menit", price: "IDR 150.000", details: ["3x Ice Breaking", "3x Fun Game", "1x Makan", "Snack"], },
    ],
    eoWo: [
        { id: "eo1", name: "SILVER PACKAGE", price: "IDR 25.000.000", details: ["Backsound (mp3, audio)", "MC + Tim EO (2 orang)", "Dekorasi panggung standar",], },
        { id: "eo2", name: "GOLD PACKAGE", price: "IDR 35.000.000", details: ["MC + Tim EO (4 orang)", "Dekorasi panggung medium", "Dokumentasi Video & Foto", "Drone",], },
        { id: "eo3", name: "PLATINUM PACKAGE", price: "IDR 65.000.000", details: ["MC + Tim EO (6 orang)", "Dekorasi panggung full", "Live Streaming", "Undangan digital",], },
    ],
};

function parsePrice(priceStr) {
    if (!priceStr || typeof priceStr !== "string") return 0;
    const numberString = priceStr.replace(/[^0-9]/g, "");
    return parseInt(numberString, 10) || 0;
}

const Sukabumi = () => {
    const [currentFilter, setCurrentFilter] = useState("all");

    let filteredPackages = [];
    if (currentFilter === "paket") {
        filteredPackages = [...eventData.capacityBuilding, ...eventData.eoWo];
    } else {
        filteredPackages = sukabumiData.packages.filter(
            (pkg) => currentFilter === "all" || pkg.group === currentFilter
        );
    }

    const heroBgStyle = {
        backgroundImage: `url(${sukabumiData.bgImage})`,
    };

    return (
        <div className="sukabumi-page">
            <header className="detail-hero-section" style={heroBgStyle}>
                <div className="detail-hero-overlay">
                    <h1 className="detail-hero-title">{sukabumiData.title}</h1>
                    <p className="detail-hero-subtitle">{sukabumiData.description}</p>
                </div>
            </header>

            <section id="destination-menu" className="destination-menu-section">
                <div className="filter-buttons">
                    <button className={`filter-btn ${currentFilter === "all" ? "active" : ""}`} onClick={() => setCurrentFilter("all")}>Semua</button>
                    <button className={`filter-btn ${currentFilter === "paket-wisata" ? "active" : ""}`} onClick={() => setCurrentFilter("paket-wisata")}>Paket Wisata</button>
                    <button className={`filter-btn ${currentFilter === "overland" ? "active" : ""}`} onClick={() => setCurrentFilter("overland")}>Overland | UMUM</button>
                    <button className={`filter-btn ${currentFilter === "one-day-trip" ? "active" : ""}`} onClick={() => setCurrentFilter("one-day-trip")}>One Day Trip</button>
                    <button className={`filter-btn ${currentFilter === "paket" ? "active" : ""}`} onClick={() => setCurrentFilter("paket")}>Paket Event</button>
                </div>

                <div className="destination-groups">
                    {currentFilter === "paket" ? (
                        <>
                            <section className="section">
                                <div className="section-title yellow-bg">CAPACITY BUILDING PACKAGE</div>
                                <div className="package-grid">
                                    {eventData.capacityBuilding.map((pkg) => (
                                        <div className="package-box" key={pkg.id}>
                                            <h4 className="gold">{pkg.name}<br />{pkg.duration}</h4>
                                            <div className="price">{pkg.price}</div>
                                            <ul>{pkg.details.map((detail, index) => (<li key={index}>{detail}</li>))}</ul>
                                            <Link to="/pembayaran" state={{ package_id: pkg.id, namaPaket: pkg.name, harga: parsePrice(pkg.price), }} className="detail-btn">Pesan Sekarang</Link>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="section">
                                <div className="section-title yellow-bg">EVENT PACKAGE : EO/WO/DLL</div>
                                <div className="package-grid">
                                    {eventData.eoWo.map((pkg) => (
                                        <div className="package-box" key={pkg.id}>
                                            <h4 className="silver">{pkg.name}</h4>
                                            <div className="price">{pkg.price}</div>
                                            <ul>{pkg.details.map((detail, index) => (<li key={index}>{detail}</li>))}</ul>
                                            <Link to="/pembayaran" state={{ package_id: pkg.id, namaPaket: pkg.name, harga: parsePrice(pkg.price), }} className="detail-btn">Pesan Sekarang</Link>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="tour-cards-grid">
                            {filteredPackages.map((pkg) => (
                                <div className="paket-card" key={pkg.id}>
                                    <img src={pkg.image} alt={pkg.name} />
                                    <div className="paket-info">
                                        <h3>{pkg.name}</h3>
                                        <p className="subjudul">{pkg.subtitle}</p>
                                        <p className="harga">{pkg.price} <span className="min">{pkg.minPax}</span></p>
                                        <Link to="/pembayaran" state={{ package_id: pkg.id, namaPaket: pkg.name, harga: parsePrice(pkg.price), }} className="detail-btn">Pesan Sekarang</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            
            {/* --- PERBAIKAN DI SINI --- */}
            <section className="custom-cta">
                <video 
                    autoPlay    // Putar otomatis
                    muted       // Mute suara agar bisa autoplay di semua browser
                    loop        // Ulangi video terus-menerus
                    playsInline // Penting untuk iOS agar tidak fullscreen
                    className="cta-video" 
                    src={videoSection} 
                />
                <div className="cta-overlay">
                    <div className="cta-text">
                        <h2>Belum menemukan paket yang sesuai?</h2>
                        <p>Kami siap bantu merancang perjalanan khusus sesuai kebutuhan dan anggaran Anda!</p>
                        <a href={`https://wa.me/6285930005544?text=Halo, saya tertarik dengan paket di Sukabumi.`} className="cta-button" target="_blank" rel="noopener noreferrer">
                            Chat Kami Sekarang
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Sukabumi;