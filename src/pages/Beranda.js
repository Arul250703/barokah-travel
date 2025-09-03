import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCities, getPackages } from "../services/api";
import "../components/styles/Beranda.css";

// Import Aset Gambar dan Video
import Logo from "../assets/images/Logo.png";
import videoSection from "../assets/videos/video-section.mp4";
import biru from "../assets/images/biru.jpeg";
import gunung from "../assets/images/gunung.jpeg";
import bali from "../assets/images/bali.jpeg";
import jeram from "../assets/images/jeram.jpeg";
import situ from "../assets/images/situ.jpeg";
import pantaiBali from "../assets/images/pantai-bali.jpeg";
import servicesBg from "../assets/images/services-bg.jpg";
import telp from "../assets/images/telp.png";
import tameng from "../assets/images/tameng.jpeg";
import kop from "../assets/images/kop.jpeg";

const Beranda = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cities, setCities] = useState([]);
  const [allPackages, setAllPackages] = useState({});
  const [loading, setLoading] = useState(true);

  const slides = [
    { type: "video", src: videoSection, link: "PROMO 1.html" },
    { type: "image", src: biru, link: "PROMO 2.html" },
    { type: "image", src: gunung, link: "PROMO 3.html" },
    { type: "image", src: bali, link: "PROMO 4.html" },
  ];

  // Load cities dan packages dari API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Ambil daftar kota
        const citiesResponse = await getCities();
        const citiesData = citiesResponse.data;
        setCities(citiesData);

        // Ambil paket untuk setiap kota
        const packagesData = {};
        for (const city of citiesData) {
          try {
            const packagesResponse = await getPackages(city.city_name);
            packagesData[city.city_name.toLowerCase()] = packagesResponse.data;
          } catch (err) {
            console.error(
              `Error fetching packages for ${city.city_name}:`,
              err
            );
            packagesData[city.city_name.toLowerCase()] = [];
          }
        }

        setAllPackages(packagesData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Slideshow functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 7000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Function untuk render tour cards dari API
  const renderTourCardsFromAPI = (cityKey, title, linkTo) => {
    const packages = allPackages[cityKey] || [];

    if (packages.length === 0) {
      return (
        <section className="tour-cards-section">
          <h3 className="tour-section-title">
            {title}
            <Link to={linkTo} className="lihat-semua-link">
              Lihat Semua
            </Link>
          </h3>
          <div className="no-packages-message">
            <p>Belum ada paket wisata tersedia untuk {title}</p>
          </div>
        </section>
      );
    }

    return (
      <section className="tour-cards-section">
        <h3 className="tour-section-title">
          {title}
          <Link to={linkTo} className="lihat-semua-link">
            Lihat Semua
          </Link>
        </h3>
        <div className="scroll-container">
          {packages.map((pkg) => (
            <div key={pkg.id} className="tour-card">
              <img
                src={pkg.imageUrl || situ}
                alt={pkg.package_name}
                onError={(e) => {
                  e.target.src = situ; // fallback image jika gambar dari API error
                }}
              />
              <div className="card-body">
                <h4>{pkg.package_name}</h4>
                <div className="card-price">
                  <p className="price-label">Mulai dari</p>
                  <strong className="price-value">
                    IDR {pkg.price.toLocaleString()}
                  </strong>
                </div>
                <Link to={linkTo} className="detail-button">
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="beranda-content">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Memuat paket wisata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="beranda-content">
      <header className="hero-section">
        <div className="slideshow-container">
          {slides.map((slide, index) => (
            <a
              href={slide.link}
              key={index}
              className={`bg-slide ${index === currentSlide ? "active" : ""}`}
            >
              {slide.type === "video" ? (
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
                className={`dot ${index === currentSlide ? "active" : ""}`}
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
              <img
                src={pantaiBali}
                alt="Overland Umum"
                className="icon-image"
              />
            </div>
            <h3 className="icon-title">Overland Umum</h3>
          </a>
          <a href="" className="tour-icon-item">
            <div className="icon-circle">
              <img
                src={servicesBg}
                alt="Event Organizer"
                className="icon-image"
              />
            </div>
            <h3 className="icon-title">Event Organizer</h3>
          </a>
        </div>
      </div>

      {/* Render semua paket dari API berdasarkan kota */}
      {cities.map((city) => {
        const cityKey = city.city_name.toLowerCase();
        const packages = allPackages[cityKey] || [];

        // Hanya render jika ada paket untuk kota tersebut
        if (packages.length > 0) {
          return renderTourCardsFromAPI(
            cityKey,
            `PAKET WISATA ${city.city_name.toUpperCase()}`,
            `/${cityKey}`
          );
        }
        return null;
      })}

      <div className="include-bar">
        <span>INCLUDE</span>
        BUS PARIWISATA | AIR MINERAL | DOORPRIZE | TRAVEL BOX | ASURANSI TIKET
        WISATA | P3K | TOL & PARKIR | BANNER | TOUR GUIDE | DOKUMENTASI
      </div>

      <section className="event-organizer-section">
        <h3 className="section-title">INFORMASI LAYANAN EVENT ORGANIZER</h3>
        <div className="package-buttons">
          <Link to="/layanan" className="btn btn-primary">
            CAPACITY BUILDING PACKAGE
          </Link>
          <Link to="/layanan" className="btn btn-primary">
            EVENT PACKAGE : EO/WO/DLL
          </Link>
        </div>
      </section>

      <section className="why-us-section-event">
        <h2>Kenapa Harus Kami?</h2>
        <div className="why-us-cards-event">
          <div className="why-us-card-event">
            <img src={telp} alt="Icon Respon Cepat" />
            <h3>Respon Cepat & Ramah</h3>
            <p>
              Kami merespon kebutuhan pelanggan dengan cepat dan ramah. Tim
              customer service kami siap membantu Anda kapan pun dibutuhkan.
            </p>
          </div>
          <div className="why-us-card-event">
            <img src={tameng} alt="Icon Terpercaya" />
            <h3>Terpercaya & Berpengalaman</h3>
            <p>
              Kami telah dipercaya oleh banyak pelanggan dan memiliki pengalaman
              dalam menangani berbagai jenis event dengan aman dan profesional.
            </p>
          </div>
          <div className="why-us-card-event">
            <img src={kop} alt="Icon Trip" />
            <h3>Perjalanan Terencana dengan Baik</h3>
            <p>
              Setiap perjalanan disusun dengan baik, mulai dari jadwal,
              transportasi, logistik, hingga akomodasi, untuk memastikan
              kenyamanan Anda.
            </p>
          </div>
        </div>
      </section>

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
              href="https://wa.me/6285930005544"
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

export default Beranda;
