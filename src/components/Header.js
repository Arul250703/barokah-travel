import React from 'react';
import './styles/Header.css'; // Jalur diperbaiki

function Header() {
  return (
    <header className="header">
      <div className="logo">Barokah Tour</div>
      <nav>
        <ul>
          <li><a href="#">Beranda</a></li>
          <li><a href="#">Tentang</a></li>
          <li><a href="#">Layanan</a></li>
          <li><a href="#">Kontak</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;