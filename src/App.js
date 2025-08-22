import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import AdminLayout from './components/AdminLayout';

// Pages
import Beranda from './pages/Beranda';
import Tentang from './pages/Tentang';
import Layanan from './pages/Layanan';
import Travel from './pages/Travel';
import Cabang from './pages/Cabang';
import Sukabumi from './pages/Sukabumi';
import Pelabuan from './pages/Pelabuan';
import Yogyakarta from './pages/Yogyakarta';
import Semarang from './pages/Semarang';
import Surabaya from './pages/Surabaya';
import DetailPembayaran from './pages/DetailPembayaran';
import Invoice from './pages/Invoice';
import VirtualAccountPage from './pages/VirtualAccountPage';
import PaymentStatus from './pages/PaymentStatus';
import Tiket from './pages/Tiket';
import DetailNews from './pages/DetailNews';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Keuangan from './pages/Keuangan';
import Register from './pages/Register';
import ScannerPage from './pages/ScannerPage';
import TiketPage from './pages/TiketPage';
import QrPage from './pages/QrPage';
import BukuTamu from './pages/BukuTamu';
import HalamanBukuTamu from './pages/HalamanBukuTamu';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';

// Layout untuk user (Header + Footer)
const SiteLayout = () => {
  const location = useLocation();
  const hideFooterRoutes = ["/halamanbukutamu"];
  const hideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </>
  );
};

// Layout untuk Admin (Sidebar)
const AdminLayoutWrapper = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

// Komponen Halaman 404
const NotFoundPage = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
      <p style={{ fontSize: "1.2rem" }}>Halaman Tidak Ditemukan</p>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Grup 1: Halaman dengan Header & Footer */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Beranda />} />
            <Route path="/tentang" element={<Tentang />} />
            <Route path="/layanan" element={<Layanan />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/cabang" element={<Cabang />} />
            <Route path="/sukabumi" element={<Sukabumi />} />
            <Route path="/pelabuan" element={<Pelabuan />} />
            <Route path="/yogyakarta" element={<Yogyakarta />} />
            <Route path="/semarang" element={<Semarang />} />
            <Route path="/surabaya" element={<Surabaya />} />
            <Route path="/travel/:id" element={<DetailNews />} />
            <Route path="/register" element={<Register />} />
            <Route path="/halamanbukutamu" element={<HalamanBukuTamu />} />
          </Route>

          {/* Grup 2: Halaman tanpa Header & Footer (Proses Pembayaran, dll) */}
          <Route path="/pembayaran" element={<DetailPembayaran />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/virtual-account" element={<VirtualAccountPage />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="/tiket" element={<Tiket />} />
          <Route path="/tiket/:bookingId" element={<TiketPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* Grup 3: Halaman Admin (dengan Sidebar) */}
          <Route element={<AdminLayoutWrapper />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/keuangan" element={<Keuangan />} />
            <Route path="/qr-page" element={<QrPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/bukutamu" element={<BukuTamu />} />
            <Route path="/users" element={<UsersPage />} />
            {/* Tambahan halaman admin placeholder */}
            <Route path="/event" element={<div>Event Page (Coming Soon)</div>} />
            <Route path="/bookings" element={<div>Bookings Page (Coming Soon)</div>} />
            <Route path="/reports" element={<div>Reports Page (Coming Soon)</div>} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
