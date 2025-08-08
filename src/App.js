// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Import semua komponen halaman
import Beranda from './pages/Beranda';
import Tentang from './pages/Tentang';
import Layanan from './pages/Layanan';
import Travel from './pages/Travel';
import Cabang from './pages/Cabang';
// Import komponen halaman detail yang baru
import Sukabumi from './pages/Sukabumi';
import Yogyakarta from './pages/Yogyakarta';
import Semarang from './pages/Semarang';
import Surabaya from './pages/Surabaya';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/tentang" element={<Tentang />} />
        <Route path="/layanan" element={<Layanan />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/cabang" element={<Cabang />} />
        {/* Tambahkan Rute Baru di Sini */}
        <Route path="/sukabumi" element={<Sukabumi />} />
        <Route path="/yogyakarta" element={<Yogyakarta />} />
        <Route path="/semarang" element={<Semarang />} />
        <Route path="/surabaya" element={<Surabaya />} />
        {/* Anda juga mungkin butuh rute untuk travel news */}
        <Route path="/travel/:id" element={<div>Halaman Berita Detail</div>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;