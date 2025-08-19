import React from 'react';
import Sidebar from './Sidebar';
import './styles/Layout.css';

// Layout utama yang akan membungkus semua halaman admin
const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;