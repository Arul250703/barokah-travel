import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/images/Logo.png';
import '../components/styles/Header.css';

// Import Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faInstagram, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhoneVolume, faUser, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    };

    return (
        <header className="page-header">
            <div className="top-bar">
                <div className="top-bar-container">
                    <div className="contact-info">
                        <a href="https://wa.me/6285930005544" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faWhatsapp} /> 
                            <span className="contact-text">+62 859 3000 5544</span>
                        </a>
                        <a href="mailto:barokahtour.travel@gmail.com" className="email-link">
                            <FontAwesomeIcon icon={faEnvelope} /> 
                            <span className="contact-text">barokahtour.travel@gmail.com</span>
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
                    <Link to="/" className="site-brand" onClick={closeMobileMenu}>
                        <img src={Logo} alt="Barokah Tour and Travel Logo" />
                    </Link>
                    
                    {/* Mobile Menu Button */}
                    <button 
                        className="mobile-menu-btn"
                        onClick={handleMobileMenuToggle}
                        aria-label="Toggle mobile menu"
                    >
                        <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
                    </button>

                    {/* Navigation Menu */}
                    <ul className={`navbar-nav ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                        <li>
                            <Link 
                                to="/" 
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                Beranda
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/tentang" 
                                className={`nav-link ${isActive('/tentang') ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                Tentang kami
                            </Link>
                        </li>
                        <li className={`nav-item dropdown ${isDropdownOpen ? 'open' : ''}`}>
                            <a 
                                href="#" 
                                className="nav-link dropdown-toggle" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDropdownToggle();
                                }}
                            >
                                Cabang
                            </a>
                            <ul className="dropdown-menu">
                                <li>
                                    <Link 
                                        to="/sukabumi" 
                                        className="dropdown-link"
                                        onClick={closeMobileMenu}
                                    >
                                        Sukabumi
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/yogyakarta" 
                                        className="dropdown-link"
                                        onClick={closeMobileMenu}
                                    >
                                        Yogyakarta
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/semarang" 
                                        className="dropdown-link"
                                        onClick={closeMobileMenu}
                                    >
                                        Semarang
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/surabaya" 
                                        className="dropdown-link"
                                        onClick={closeMobileMenu}
                                    >
                                        Surabaya
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <Link 
                                to="/layanan" 
                                className={`nav-link ${isActive('/layanan') ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                Layanan
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/travel" 
                                className={`nav-link ${isActive('/travel') ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                Travel News
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/halamanbukutamu" 
                                className={`nav-link ${isActive('/halamanbukutamu') ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                Buku Tamu
                            </Link>
                        </li>
                        <li className="admin-link">
                            <Link 
                                to="/admin" 
                                // className="btn btn-primary"
                                onClick={closeMobileMenu}
                            >
                                <FontAwesomeIcon icon={faUser} />
                                <span className="admin-text"></span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;