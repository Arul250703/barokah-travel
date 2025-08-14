import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../components/styles/Admin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';

// Import logo
import logo from '../assets/images/Logo.png';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        // Logika registrasi sederhana (contoh)
        if (username && email && password) {
            alert('Registrasi berhasil! Silakan login.');
            navigate('/admin');
        } else {
            setError('Harap lengkapi semua field.');
        }
    };

    return (
        <div className="admin-page">
            <div className="login-card">
                {/* === BAGIAN KIRI (FORM REGISTRASI) === */}
                <div className="form-panel">
                    <div className="logo-container">
                        <img src={logo} alt="Logo Barokah Tour" />
                    </div>
                    
                    <h1 className="login-title">Register</h1>
                    <p className="login-subtitle">Create a new account</p>
                    
                    <form onSubmit={handleRegister}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn">REGISTER</button>
                    </form>
                    
                    <p className="register-text">
                        Already have an account? <Link to="/admin" className="register-link">Log In</Link>
                    </p>
                </div>

                {/* === BAGIAN KANAN (SOCIAL REGISTER) === */}
                <div className="social-panel">
                    <h2 className="social-title">Sign Up</h2>
                    <p className="social-subtitle">with one of your social profiles</p>
                    <div className="social-icons">
                        <button className="icon-btn twitter"><FontAwesomeIcon icon={faTwitter} /></button>
                        <button className="icon-btn facebook"><FontAwesomeIcon icon={faFacebookF} /></button>
                        <button className="icon-btn google"><FontAwesomeIcon icon={faGoogle} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
