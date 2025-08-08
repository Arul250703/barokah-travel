// src/components/Hero.js
import React from 'react';
import './styles/Hero.css';

import bgImage from '../assets/images/dreamland.jpeg';
import baliImg from '../assets/images/bali.jpeg';      // pastikan nama file sesuai
import lombokImg from '../assets/images/biru.jpeg';    // contoh gunakan biru.jpeg sebagai lombok
import jogjaImg from '../assets/images/about-img.jpg'; // contoh gunakan about-img.jpg untuk jogja

function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay">
        <div className="hero-content">
          <h1>Selamat Datang di Barokah Tour</h1>
          <p>Temukan destinasi impian Anda bersama kami</p>
          <button>Jelajahi Sekarang</button>
        </div>

        <div className="tour-packages">
          <h2>Paket Wisata Unggulan</h2>
          <div className="packages-grid">
            <div className="package-card">
              <img src={baliImg} alt="Bali" />
              <h3>Bali 3 Hari 2 Malam</h3>
              <p>Eksplorasi pantai, budaya, dan kuliner khas Bali.</p>
              <span>Mulai dari Rp 2.500.000</span>
            </div>

            <div className="package-card">
              <img src={lombokImg} alt="Lombok" />
              <h3>Lombok Adventure</h3>
              <p>Petualangan seru menjelajah Gili Trawangan dan Rinjani.</p>
              <span>Mulai dari Rp 3.000.000</span>
            </div>

            <div className="package-card">
              <img src={jogjaImg} alt="Yogyakarta" />
              <h3>Yogyakarta Heritage</h3>
              <p>Kunjungi Candi Borobudur, Malioboro, dan budaya Jawa.</p>
              <span>Mulai dari Rp 1.800.000</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
