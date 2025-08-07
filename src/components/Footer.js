import React from 'react';
import './styles/Footer.css';

// Impor logo bank dari direktori assets
import bcaLogo from '../assets/images/bca.png';
import bniLogo from '../assets/images/bni.png';
function Footer() {
  return (
    <footer className="footer">
      <p>Copyright © 2025 PT. Bina Barokah Sejahtera</p>
      <div className="bank-logos">
        <img src={bcaLogo} alt="Logo Bank BCA" />
        <img src={bniLogo} alt="Logo Bank BNI" />
      </div>
    </footer>
  );
}

export default Footer;