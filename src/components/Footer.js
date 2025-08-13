import React from 'react';
import { Link } from 'react-router-dom';
import '../components/styles/Footer.css';


import mandiri from '../assets/images/mandiri.png';
import bca from '../assets/images/bca.png';
import bni from '../assets/images/bni.png';
import asita from '../assets/images/asita.png';
import won from '../assets/images/won.png';

const Footer = () => {
    return (
        <footer>
            <div className="main-footer">
                <div className="footer-container">
                    <div className="footer-col">
                        <h3>PT. Bina Barokah Sejahtera</h3>
                        <p>
                            Selamat Datang di PT. Bina Barokah Tour – Awali Perjalanan Istimewa Anda Bersama Kami!<br /><br />
                            Mari jelajahi keindahan dunia dengan tenang dan nyaman – karena setiap langkah adalah berkah dan kenangan tak ternilai.
                        </p>
                    </div>
                    <div className="footer-col">
                        <h3>Kantor Pusat</h3>
                        <ul>
                            <li>🏢 GEDUNG GRAHA BAROKAH</li>
                            <li>📍 Jl. Raya Cisaat No. 1 Sukamanah Cisaat – Sukabumi</li>
                            <li>📧 <a href="mailto:barokahtour.travel@gmail.com">barokahtour.travel@gmail.com</a></li>
                            <li>📞
                                <a href="https://wa.me/62266230408" target="_blank" rel="noopener noreferrer">0266 230 408</a> /
                                <a href="https://wa.me/6285930005544" target="_blank" rel="noopener noreferrer">0859 3000 5544</a>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <section className="lokasi">
                            <h3>Lokasi Kami</h3>
                            <div className="map-container">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8413543183374!2d106.89146117356522!3d-6.9095652676201915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68482b702b6599%3A0xfd5d3d335f6d8bd8!2sBarokah%20Tour%20%26%20Travel!5e0!3m2!1sid!2sid!4v1752729967693!5m2!1sid!2sid"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                                
                            </div>
                            
                        </section>
                    </div>
                </div>
            </div>

            <div className="footer-bar">
                <div className="footer-content-bar">
                    <div className="footer-logos">
                        <img src={mandiri} alt="Mandiri" />
                        <img src={bca} alt="BCA" />
                        <img src={bni} alt="BNI" />
                        <img src={asita} alt="Kemenag RI" />
                        <img src={won} alt="Wonderful Indonesia" />
                    </div>
                    <div className="footer-text">
                        <p>Copyright © 2025 PT. Bina Barokah Sejahtera</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
