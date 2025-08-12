// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Beranda from "./pages/Beranda";
import Tentang from "./pages/Tentang";
import Layanan from "./pages/Layanan";
import Travel from "./pages/Travel";
import Cabang from "./pages/Cabang";

import Sukabumi from "./pages/Sukabumi";
import Yogyakarta from "./pages/Yogyakarta";
import Semarang from "./pages/Semarang";
import Surabaya from "./pages/Surabaya";

import DetailPembayaran from "./pages/DetailPembayaran";
import Invoice from "./pages/Invoice";
import VirtualAccountPage from "./pages/VirtualAccountPage" 
import Tiket from "./pages/Tiket"

function AppLayout() {
  const location = useLocation();

  // daftar path yang tidak mau pakai header & footer
  const noLayoutPaths = ["/invoice"];
  const isNoLayout = noLayoutPaths.includes(location.pathname);

  return (
    <>
      {!isNoLayout && <Header />}
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/tentang" element={<Tentang />} />
        <Route path="/layanan" element={<Layanan />} />
        <Route path="/travel" element={<Travel />} />
        <Route path="/cabang" element={<Cabang />} />

        <Route path="/sukabumi" element={<Sukabumi />} />
        <Route path="/yogyakarta" element={<Yogyakarta />} />
        <Route path="/semarang" element={<Semarang />} />
        <Route path="/surabaya" element={<Surabaya />} />

        <Route path="/pembayaran" element={<DetailPembayaran />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/virtual-account" element={<VirtualAccountPage />} />
        <Route path="/tiket" element={<Tiket />} />
      </Routes>
      {!isNoLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
