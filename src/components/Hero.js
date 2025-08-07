import React from 'react';
import './styles/Hero.css';
import bgImage from '../assets/images/dreamland.jpeg'; // Baris ini diperlukan untuk mendefinisikan bgImage

function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="hero-content">
        <h1>Selamat Datang di Barokah Tour</h1>
        <p>Temukan destinasi impian Anda bersama kami</p>
        <button>Jelajahi Sekarang</button>
      </div>
    </section>
  );
}

export default Hero;