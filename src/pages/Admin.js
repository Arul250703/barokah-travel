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
    const [isLoading, setIsLoading] = useState(false); // State untuk loading
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Mulai loading
        setError(''); // Bersihkan error sebelumnya

        try {
            // 1. Kirim data ke backend menggunakan fetch
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            // 2. Periksa respons dari backend
            if (response.ok) { // Jika status response adalah 2xx (sukses)
                console.log('Login berhasil dari frontend');
                navigate('/dashboard');
            } else {
                // Jika backend mengirim error (misal: status 401)
                setError(data.message || 'Terjadi kesalahan.');
            }
        } catch (err) {
            // Jika terjadi error jaringan (misal: backend tidak jalan)
            setError('Tidak dapat terhubung ke server. Pastikan server backend berjalan.');
            console.error('Error saat login:', err);
        } finally {
            setIsLoading(false); // Selesai loading
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
                        {/* Tombol akan nonaktif saat loading */}
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? 'LOADING...' : 'LOG IN'}
                        </button>
                    </form>
                    
                    <Link to="/" className="forgot-link">Forgot Password?</Link>
                </div>

                <div className="social-panel">
                    {/* ... bagian social panel tidak berubah ... */}
                </div>
            </div>
        </div>
    );
};

export default Admin;
