import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../components/styles/Admin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhoneVolume, faUser } from '@fortawesome/free-solid-svg-icons';

// Import logo
import logo from '../assets/images/Logo.png';

const Admin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Logika login sederhana
        if (username === 'admin' && password === 'admin123') {
            navigate('/dashboard');
        } else {
            setError('Username atau password salah.');
        }
    };

    return (
        <div className="admin-page">
            <div className="login-card">
                {/* === BAGIAN KIRI (FORM LOGIN) === */}
                <div className="form-panel">
                    <div className="logo-container">
                        <img src={logo} alt="Logo Barokah Tour" />
                    </div>
                    
                    <h1 className="login-title">Log In</h1>
                    <p className="login-subtitle">to your account</p>
                    
                    <form onSubmit={handleLogin}>
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
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn">LOG IN</button>
                    </form>
                    
                    <Link to="/" className="forgot-link">Forgot Password?</Link>
                </div>

                {/* === BAGIAN KANAN (SOCIAL LOGIN) === */}
                <div className="social-panel">
                    <h2 className="social-title">Sign In</h2>
                    <p className="social-subtitle">with one of your social profiles</p>
                    <div className="social-icons">
                        <button className="icon-btn twitter"><FontAwesomeIcon icon={faTwitter} /></button>
                        <button className="icon-btn facebook"><FontAwesomeIcon icon={faFacebookF} /></button>
                        <button className="icon-btn google"><FontAwesomeIcon icon={faGoogle} /></button>
                    </div>
                    <p className="register-text">
                        Don't have an account? <Link to="/register" className="register-link">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Admin;
