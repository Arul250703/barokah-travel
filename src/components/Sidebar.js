import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaBook,
  FaChartBar,
  FaHome,
  FaUsers,
  FaCog,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./styles/Sidebar.css";
import { FaQrcode } from "react-icons/fa";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const isActiveLink = (path) => {
    return (
      location.pathname === path ||
      (path === "/keuangan" &&
        location.pathname.toLowerCase().includes("keuangan"))
    );
  };

  const menuItems = [
    {
      path: "/dashboard",
      icon: FaTachometerAlt,
      text: "Dashboard",
      tooltip: "Dashboard",
    },
    {
      path: "/qr-page",
      icon: FaQrcode,
      text: "QR Page",
      tooltip: "QR Page",
    },
    {
      path: "/bookings",
      icon: FaClipboardList,
      text: "Pemesanan",
      tooltip: "Pemesanan",
    },
    {
      path: "/keuangan",
      icon: FaFileInvoiceDollar,
      text: "Keuangan / Invoice",
      tooltip: "Keuangan",
    },
    {
      path: "/bukutamu",
      icon: FaBook,
      text: "Buku Tamu",
      tooltip: "Buku Tamu",
    },
    {
      path: "/reports",
      icon: FaChartBar,
      text: "Laporan",
      tooltip: "Laporan",
    },
    {
      path: "/users",
      icon: FaUsers,
      text: "Pengguna",
      tooltip: "Pengguna",
    },
    {
      path: "/settings",
      icon: FaCog,
      text: "Pengaturan",
      tooltip: "Pengaturan",
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        className={`sidebar-toggle ${isMobile && isMobileOpen ? "active" : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isMobile && isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Overlay */}
      {isMobile && (
        <div
          className={`sidebar-overlay ${isMobileOpen ? "active" : ""}`}
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobile && isMobileOpen ? "mobile-open" : ""
        } ${isMobile ? "mobile-sidebar" : ""}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">BT</div>
            {!isCollapsed && <h2>Admin Panel</h2>}
          </div>

          {/* Desktop Toggle Button */}
          {!isMobile && (
            <button
              className="desktop-toggle-btn"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
            >
              <FaBars />
            </button>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content">
          {/* Main Navigation */}
          <ul className="sidebar-menu">
            {!isCollapsed && (
              <li className="sidebar-section-title">Menu Utama</li>
            )}
            {menuItems.slice(0, 6).map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={isActiveLink(item.path) ? "active" : ""}
                    data-tooltip={item.tooltip}
                    onClick={closeMobileSidebar}
                  >
                    <IconComponent className="icon" />
                    <span className="menu-text">{item.text}</span>
                  </Link>
                </li>
              );
            })}
            {!isCollapsed && (
              <li className="sidebar-section-title">Pengaturan</li>
            )}
            {menuItems.slice(6).map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={isActiveLink(item.path) ? "active" : ""}
                    data-tooltip={item.tooltip}
                    onClick={closeMobileSidebar}
                  >
                    <IconComponent className="icon" />
                    <span className="menu-text">{item.text}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <Link to="/" onClick={closeMobileSidebar} data-tooltip="Beranda">
            <FaHome className="icon" />
            <span className="menu-text">Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
