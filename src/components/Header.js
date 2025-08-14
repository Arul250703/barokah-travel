import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/images/Logo.png';
import '../components/styles/Header.css';

// Import Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faInstagram, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhoneVolume } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faPhoneVolume, faUser } from '@fortawesome/free-solid-svg-icons';


const Header = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="page-header">
            <div className="top-bar">
                <div className="top-bar-container">
                    <div className="contact-info">
                        <a href="https://wa.me/6285930005544" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faWhatsapp} /> +62 859 3000 5544
                        </a>
                        <a href="mailto:barokahtour.travel@gmail.com">
                            <FontAwesomeIcon icon={faEnvelope} /> barokahtour.travel@gmail.com
                        </a>
                    </div>
                    <div className="social-icons">
                        <a href="https://www.instagram.com/barokahtourindonesia_/" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="https://www.tiktok.com/@barokahtour_?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faTiktok} />
                        </a>
                        <a href="https://youtube.com/@barokahtoursmi?si=-yRfaFEfKaC-lelk" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faYoutube} />
                        </a>
                    </div>
                </div>
            </div>
            <nav className="main-navbar">
                <div className="main-navbar-container">
                    <Link to="/" className="site-brand">
                        <img src={Logo} alt="Barokah Tour and Travel Logo" />
                    </Link>
                    <ul className="navbar-nav">
                        <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Beranda</Link></li>
                        <li><Link to="/tentang" className={`nav-link ${isActive('/tentang') ? 'active' : ''}`}>Tentang kami</Link></li>
                        <li className={`nav-item dropdown ${isDropdownOpen ? 'open' : ''}`} onMouseEnter={handleDropdownToggle} onMouseLeave={handleDropdownToggle}>
                            <a href="#" className="nav-link dropdown-toggle" onClick={(e) => e.preventDefault()}>Cabang</a>
                            <ul className="dropdown-menu">
                                <li><Link to="/sukabumi" className="dropdown-link">Sukabumi</Link></li>
                                <li><Link to="/yogyakarta" className="dropdown-link">Yogyakarta</Link></li>
                                <li><Link to="/semarang" className="dropdown-link">Semarang</Link></li>
                                <li><Link to="/surabaya" className="dropdown-link">Surabaya</Link></li>
                            </ul>
                        </li>
                        <li><Link to="/layanan" className={`nav-link ${isActive('/layanan') ? 'active' : ''}`}>Layanan</Link></li>
                        <li><Link to="/travel" className={`nav-link ${isActive('/travel') ? 'active' : ''}`}>Travel News</Link></li>
                        <li>

                            {/* PERBAIKAN: Menambahkan ikon Font Awesome */}
                            <a href="https://wa.me/6285930005544" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faPhoneVolume} style={{ marginRight: '8px' }} />
                                Pesan Sekarang
                            </a>

                            <Link to="/admin" className="btn btn-primary">
                                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                Login Admin
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
