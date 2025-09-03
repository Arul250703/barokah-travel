import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../components/styles/Sukabumi.css";
import videoSection from "../assets/videos/video-section.mp4";

// event package (masih statis, karena tidak ada di database)
const eventData = {
  capacityBuilding: [
    {
      id: "cb1",
      name: "Paket Standar",
      duration: "60-90 Menit",
      price: "IDR 50.000",
      details: ["3x Ice Breaking", "3x Fun Game", "Air Mineral 600ml", "Snack"],
    },
    {
      id: "cb2",
      name: "Paket Premium",
      duration: "60-120 Menit",
      price: "IDR 100.000",
      details: [
        "3x Ice Breaking",
        "5x Fun Game",
        "Game Kelompok",
        "Snack + Refreshment",
      ],
    },
    {
      id: "cb3",
      name: "Paket Standar Plus",
      duration: "60-90 Menit",
      price: "IDR 150.000",
      details: ["3x Ice Breaking", "3x Fun Game", "1x Makan", "Snack"],
    },
  ],
  eoWo: [
    {
      id: "eo1",
      name: "SILVER PACKAGE",
      price: "IDR 25.000.000",
      details: [
        "Backsound (mp3, audio)",
        "MC + Tim EO (2 orang)",
        "Dekorasi panggung standar",
      ],
    },
    {
      id: "eo2",
      name: "GOLD PACKAGE",
      price: "IDR 35.000.000",
      details: [
        "MC + Tim EO (4 orang)",
        "Dekorasi panggung medium",
        "Dokumentasi Video & Foto",
        "Drone",
      ],
    },
    {
      id: "eo3",
      name: "PLATINUM PACKAGE",
      price: "IDR 65.000.000",
      details: [
        "MC + Tim EO (6 orang)",
        "Dekorasi panggung full",
        "Live Streaming",
        "Undangan digital",
      ],
    },
  ],
};

function parsePrice(priceStr) {
  if (!priceStr || typeof priceStr !== "string") return 0;
  const numberString = priceStr.replace(/[^0-9]/g, "");
  return parseInt(numberString, 10) || 0;
}

const Sukabumi = () => {
  const [currentFilter, setCurrentFilter] = useState("all");
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch data dari API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/packages?city=Sukabumi"
        );
        setPackages(res.data || []);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  let filteredPackages = [];
  if (currentFilter === "paket") {
    filteredPackages = [...eventData.capacityBuilding, ...eventData.eoWo];
  } else {
    filteredPackages = packages.filter(
      (pkg) => currentFilter === "all" || pkg.group === currentFilter
    );
  }

  return (
    <div className="sukabumi-page">
      {/* Hero Section */}
      <header
        className="detail-hero-section"
        style={{ backgroundImage: `url(${packages[0]?.image || ""})` }}
      >
        <div className="detail-hero-overlay">
          <h1 className="detail-hero-title">Paket Wisata Pilihan</h1>
          <p className="detail-hero-subtitle">
            Jawa Barat & Destinasi Populer Lainnya
          </p>
        </div>
      </header>

      {/* Filter */}
      <section id="destination-menu" className="destination-menu-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${currentFilter === "all" ? "active" : ""}`}
            onClick={() => setCurrentFilter("all")}
          >
            Semua
          </button>
          <button
            className={`filter-btn ${
              currentFilter === "paket-wisata" ? "active" : ""
            }`}
            onClick={() => setCurrentFilter("paket-wisata")}
          >
            Paket Wisata
          </button>
          <button
            className={`filter-btn ${
              currentFilter === "overland" ? "active" : ""
            }`}
            onClick={() => setCurrentFilter("overland")}
          >
            Overland | UMUM
          </button>
          <button
            className={`filter-btn ${
              currentFilter === "one-day-trip" ? "active" : ""
            }`}
            onClick={() => setCurrentFilter("one-day-trip")}
          >
            One Day Trip
          </button>
          <button
            className={`filter-btn ${
              currentFilter === "paket" ? "active" : ""
            }`}
            onClick={() => setCurrentFilter("paket")}
          >
            Paket Event
          </button>
        </div>

        {/* Paket Event (statis) */}
        <div className="destination-groups">
          {currentFilter === "paket" ? (
            <>
              <section className="section">
                <div className="section-title yellow-bg">
                  CAPACITY BUILDING PACKAGE
                </div>
                <div className="package-grid">
                  {eventData.capacityBuilding.map((pkg) => (
                    <div className="package-box" key={pkg.id}>
                      <h4 className="gold">
                        {pkg.name}
                        <br />
                        {pkg.duration}
                      </h4>
                      <div className="price">{pkg.price}</div>
                      <ul>
                        {pkg.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                      <Link
                        to="/pembayaran"
                        state={{
                          package_id: pkg.id,
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
              </section>
              <section className="section">
                <div className="section-title yellow-bg">
                  EVENT PACKAGE : EO/WO/DLL
                </div>
                <div className="package-grid">
                  {eventData.eoWo.map((pkg) => (
                    <div className="package-box" key={pkg.id}>
                      <h4 className="silver">{pkg.name}</h4>
                      <div className="price">{pkg.price}</div>
                      <ul>
                        {pkg.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                      <Link
                        to="/pembayaran"
                        state={{
                          package_id: pkg.id,
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
              </section>
            </>
          ) : (
            // ✅ Paket dari database
            <div className="tour-cards-grid">
              {loading ? (
                <p>Loading data...</p>
              ) : filteredPackages.length === 0 ? (
                <p>Belum ada paket untuk kota ini</p>
              ) : (
                filteredPackages.map((pkg) => (
                  <div className="paket-card" key={pkg.id}>
                    <img src={pkg.image} alt={pkg.name} />
                    <div className="paket-info">
                      <h3>{pkg.name}</h3>
                      <p className="subjudul">{pkg.subtitle}</p>
                      <p className="harga">
                        {pkg.price} <span className="min">{pkg.minPax}</span>
                      </p>
                      <Link
                        to="/pembayaran"
                        state={{
                          package_id: pkg.id,
                          namaPaket: pkg.name,
                          harga: parsePrice(pkg.price),
                        }}
                        className="detail-btn"
                      >
                        Pesan Sekarang
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="custom-cta">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="cta-video"
          src={videoSection}
        />
        <div className="cta-overlay">
          <div className="cta-text">
            <h2>Belum menemukan paket yang sesuai?</h2>
            <p>
              Kami siap bantu merancang perjalanan khusus sesuai kebutuhan dan
              anggaran Anda!
            </p>
            <a
              href={`https://wa.me/6285930005544?text=Halo, saya tertarik dengan paket di Sukabumi.`}
              className="cta-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat Kami Sekarang
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sukabumi;
