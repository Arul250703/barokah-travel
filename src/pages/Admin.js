import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../components/styles/Admin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';
import logo from '../assets/images/Logo.png';

const Admin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        console.log('🔐 Memulai proses login...');
        console.log('Username:', username);

        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('📡 Response status:', response.status);

            const data = await response.json();
            console.log('📊 Response data:', data);

            if (response.ok && data.success) {
                console.log('✅ Login berhasil dari frontend');
                console.log('👤 User data:', data.user);

                // Simpan status login dan data user di localStorage
                localStorage.setItem("auth", "true");
                localStorage.setItem("user", JSON.stringify(data.user));

                // Redirect ke dashboard
                navigate('/dashboard');
            } else {
                console.log('❌ Login gagal:', data.message);
                setError(data.message || 'Login gagal. Silakan coba lagi.');
            }
        } catch (err) {
            console.error('🚨 Error saat login:', err);
            setError('Tidak dapat terhubung ke server. Pastikan server backend berjalan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="login-card">
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
                                disabled={isLoading}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? 'LOADING...' : 'LOG IN'}
                        </button>
                    </form>
                    
                    <Link to="/" className="forgot-link">Forgot Password?</Link>
                </div>

                <div className="social-panel">
                    <div className="social-content">
                        <h2>Hello, Friend!</h2>
                        <p>Enter your personal details and start journey with us</p>
                        <div className="social-icons">
                            <FontAwesomeIcon icon={faFacebookF} className="social-icon" />
                            <FontAwesomeIcon icon={faGoogle} className="social-icon" />
                            <FontAwesomeIcon icon={faTwitter} className="social-icon" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;