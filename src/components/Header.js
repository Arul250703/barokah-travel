import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/Logo.png'; 
import '../components/styles/Header.css'; 

const Header = () => {
    return (
        <nav className="navbar">
            <div className="container flex-nav">
                <Link to="/" className="site-brand">
                    <img src={Logo} alt="Barokah Tour Logo" />
                </Link>
                <ul className="navbar-nav">
                    <li><Link to="/" className="nav-link">Beranda</Link></li>
                    <li><Link to="/tentang" className="nav-link">Tentang kami</Link></li>
                    <li><a href="#" className="nav-link dropdown-toggle">Cabang</a></li>
                    <li><Link to="/layanan" className="nav-link">Layanan</Link></li>
                    <li><Link to="/travel" className="nav-link">Travel News</Link></li>
                    <li>
                        <a href="https://wa.me/6285930005544" className="nav-link btn-pesan-sekarang" target="_blank" rel="noopener noreferrer">Pesan Sekarang</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Header;
