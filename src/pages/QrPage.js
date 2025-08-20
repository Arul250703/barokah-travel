import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  FaQrcode,
  FaSearch,
  FaCheckCircle,
  FaTicketAlt,
  FaEye,
  FaUndo,
  FaBan,
  FaCamera,
  FaTimes,
  FaChevronDown,
  FaKeyboard,
  FaCheck,
  FaExclamationTriangle
} from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import "../components/styles/QrPage.css";
import "../components/styles/ScannerPage.css";
import ScannerPage from "./ScannerPage";

// Komponen Tiket dengan QR Code berisi JSON
const Tiket = ({ ticketId, nama, namaPaket, telepon }) => {
  const qrValue = JSON.stringify({ ticketId: ticketId, nama: nama });

  return (
    <div className="ticket-card">
      <div className="ticket-left">
        <div className="ticket-header">
          <span className="ticket-category">WISATA</span>
          <span className="ticket-package">{namaPaket}</span>
        </div>
        <div className="ticket-info">
          <span className="participant-name">{nama}</span>
          <span className="participant-phone">{telepon}</span>
        </div>
      </div>
      <div className="ticket-right">
        <QRCodeSVG
          value={qrValue}
          size={80}
          bgColor="#ffffff"
          fgColor="#000000"
        />
        <span className="scan-label">{ticketId}</span>
      </div>
    </div>
  );
};

// Komponen Scanner Modal yang menerima callback
const ScannerModal = ({ isOpen, onClose, onScanValidate }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState("scan"); // 'scan' or 'manual'
  const [manualInput, setManualInput] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    let scannerInstance = null;

    const initializeScanner = async () => {
      if (isOpen && isScanning && activeTab === "scan") {
        try {
          const { Html5QrcodeScanner } = await import("html5-qrcode");
          scannerInstance = new Html5QrcodeScanner(
            "qr-reader-container-modal",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              // Non-mirror camera setting
              videoConstraints: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            },
            false
          );

          const onScanSuccess = (decodedText) => {
            setIsScanning(false);
            validateTicket(decodedText);
          };

          scannerInstance.render(onScanSuccess, () => {});
          scannerRef.current = scannerInstance;
        } catch (error) {
          console.error("Failed to initialize scanner:", error);
        }
      }
    };

    initializeScanner();

    return () => {
      if (scannerInstance && typeof scannerInstance.clear === "function") {
        scannerInstance.clear().catch(() => {});
      }
    };
  }, [isOpen, isScanning, activeTab]);

  useEffect(() => {
    if (isOpen && activeTab === "scan") {
      setScanResult(null);
      setIsScanning(true);
    } else {
      setIsScanning(false);
      setScanResult(null);
    }
  }, [isOpen, activeTab]);

  const validateTicket = async (ticketId) => {
    setScanResult({
      type: "loading",
      message: "MEMPROSES...",
      name: "Memvalidasi data tiket...",
    });
    try {
      let parsedTicketId;
      try {
        const ticketData = JSON.parse(ticketId);
        parsedTicketId =
          ticketData.booking_id || ticketData.ticketId || ticketId;
      } catch {
        parsedTicketId = ticketId;
      }
      const result = await onScanValidate(parsedTicketId);
      setScanResult(result);
    } catch {
      setScanResult({
        type: "error",
        message: "QR CODE TIDAK VALID",
        name: "Format data tidak dikenali.",
      });
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    await validateTicket(manualInput.trim());
    setManualInput("");
  };

  const getResultCardClassName = () =>
    `scan-result ${scanResult ? scanResult.type : ""}`;

  const getIcon = () => {
    if (!scanResult) return null;
    switch (scanResult.type) {
      case "success":
        return <FaCheck className="result-icon" />;
      case "error":
        return <FaTimes className="result-icon" />;
      case "warning":
        return <FaExclamationTriangle className="result-icon" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-scanner" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Validasi Tiket</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {/* Scanner Toggle */}
          <div className="scanner-toggle">
            <button
              className={`toggle-btn ${activeTab === "scan" ? "active" : ""}`}
              onClick={() => setActiveTab("scan")}
            >
              <FaCamera /> Scan QR Code
            </button>
            <button
              className={`toggle-btn ${activeTab === "manual" ? "active" : ""}`}
              onClick={() => setActiveTab("manual")}
            >
              <FaKeyboard /> Input Manual
            </button>
          </div>

          {activeTab === "scan" ? (
            <>
              <div className="scanner-container">
                {isScanning && <div id="qr-reader-container-modal"></div>}
                {!isScanning && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setScanResult(null);
                      setIsScanning(true);
                    }}
                  >
                    {scanResult ? "Pindai Lagi" : "Mulai Memindai"}
                  </button>
                )}
              </div>
              <p className="scanner-instruction">
                Arahkan kamera ke QR Code pada tiket untuk memindai
              </p>
            </>
          ) : (
            <div className="manual-input-section">
              <p className="manual-input-title">
                Masukkan kode tiket secara manual
              </p>
              <form onSubmit={handleManualSubmit} className="manual-input-form">
                <input
                  type="text"
                  placeholder="Masukkan ID tiket..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="manual-input"
                />
                <button type="submit" className="manual-input-btn">
                  Validasi
                </button>
              </form>
            </div>
          )}

          {scanResult && (
            <div className={getResultCardClassName()}>
              {scanResult.type === "loading" ? (
                <>
                  <div className="result-message">{scanResult.message}</div>
                  <div className="result-details">{scanResult.name}</div>
                </>
              ) : (
                <>
                  {getIcon()}
                  <div className="result-content">
                    <div className="result-message">{scanResult.message}</div>
                    <div className="result-details">{scanResult.name}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponen StatusBadge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    valid: { class: "status-valid", label: "Valid" },
    sudah_digunakan: { class: "status-used", label: "Used" },
    hangus: { class: "status-voided", label: "Voided" },
  };
  const config = statusConfig[status] || {
    class: "status-pending",
    label: "Pending",
  };
  return <span className={`status-badge ${config.class}`}>{config.label}</span>;
};

// Komponen SummaryCard
const SummaryCard = ({ title, value, icon: Icon, color, onClick }) => (
  <div
    className={`summary-card summary-${color} ${
      onClick ? "summary-clickable" : ""
    }`}
    onClick={onClick}
  >
    <div className="summary-icon">
      <Icon />
    </div>
    <div className="summary-content">
      <h3 className="summary-title">{title}</h3>
      <div className="summary-value">{value}</div>
    </div>
  </div>
);

// Komponen TicketDetailModal
const TicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  onReset,
  onVoid,
  onViewTicket,
}) => {
  if (!isOpen || !ticket) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detail Tiket #{ticket.id}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">ID Tiket:</span>
            <span className="detail-value">{ticket.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Nama Pelanggan:</span>
            <span className="detail-value">{ticket.namaPelanggan}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{ticket.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Paket Wisata:</span>
            <span className="detail-value">{ticket.paket}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Tanggal:</span>
            <span className="detail-value">
              {new Date(ticket.tanggal).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="detail-row">
            <span className="detail-label">Peserta:</span>
            <div className="peserta-list">
              {ticket.peserta &&
                ticket.peserta.map((p, index) => (
                  <div key={index} className="peserta-item">
                    {p.nama} - {p.telepon}
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={() => onViewTicket(ticket)}
          >
            <FaTicketAlt /> Lihat Tiket
          </button>
          <button
            className="btn btn-warning"
            onClick={() => onReset(ticket.id)}
            disabled={ticket.status === "hangus"}
          >
            <FaUndo /> Reset Status
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onVoid(ticket.id)}
            disabled={ticket.status === "hangus"}
          >
            <FaBan /> Batalkan Tiket
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponen TicketPreviewModal
const TicketPreviewModal = ({ ticket, isOpen, onClose }) => {
  if (!isOpen || !ticket) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pratinjau E-Ticket #{ticket.id}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p className="preview-subtitle">
            Ini adalah tampilan tiket yang akan diterima oleh pelanggan.
          </p>
          <div className="tickets-preview">
            {ticket.peserta &&
              ticket.peserta.map((p, index) => (
                <Tiket
                  key={index}
                  ticketId={ticket.id}
                  nama={p.nama}
                  telepon={p.telepon}
                  namaPaket={ticket.paket}
                />
              ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
function QrPage() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTicketPreviewOpen, setIsTicketPreviewOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/tickets");
      const data = await response.json();

      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        console.error("API tidak mengembalikan array:", data);
        setTickets([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data tiket:", error);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleScanValidation = async (ticketId) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/tickets/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: ticketId }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        fetchTickets();
        return { type: "success", message: result.message, name: result.name };
      } else {
        if (response.status === 409) {
          return {
            type: "warning",
            message: result.message,
            name: result.name,
          };
        }
        return { type: "error", message: result.message, name: result.name };
      }
    } catch (error) {
      console.error("Error validasi:", error);
      return {
        type: "error",
        message: "KONEKSI GAGAL",
        name: "Tidak dapat terhubung ke server.",
      };
    }
  };

  const filteredTickets = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (t.namaPelanggan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterStatus === "Semua" || t.status === filterStatus)
      ),
    [tickets, searchTerm, filterStatus]
  );

  const summaryStats = useMemo(
    () => ({
      checkedIn: tickets.filter((t) => t.status === "sudah_digunakan").length,
      valid: tickets.filter((t) => t.status === "valid").length,
      total: tickets.length,
      voided: tickets.filter((t) => t.status === "hangus").length,
    }),
    [tickets]
  );

  const handleViewDetail = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(false);
    setIsTicketPreviewOpen(true);
  };

  const handleResetStatus = async (ticketId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        alert("Status tiket berhasil direset");
        fetchTickets();
      } else {
        alert("Gagal mereset status tiket");
      }
    } catch (error) {
      console.error("Error reset status:", error);
      alert("Terjadi kesalahan saat mereset status");
    }
  };

  const handleVoidTicket = async (ticketId) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan tiket ini?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/void`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        alert("Tiket berhasil dibatalkan");
        fetchTickets();
      } else {
        alert("Gagal membatalkan tiket");
      }
    } catch (error) {
      console.error("Error void ticket:", error);
      alert("Terjadi kesalahan saat membatalkan tiket");
    }
  };

  return (
    <div className="qr-page-container">
      <div className="content-header">
        <div className="header-left">
          <div className="page-title">
            <h1>Manajemen Tiket QR Code</h1>
            <p>Monitor, kelola, dan lihat riwayat pemindaian tiket</p>
          </div>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
              alt="Profile"
              className="profile-avatar"
            />
            <span className="profile-name">Admin User</span>
            <FaChevronDown className="profile-dropdown" />
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Total Tiket"
          value={summaryStats.total}
          icon={FaTicketAlt}
          color="blue"
        />
        <SummaryCard
          title="Sudah Check-in"
          value={summaryStats.checkedIn}
          icon={FaCheckCircle}
          color="green"
        />
        <SummaryCard
          title="Menunggu Check-in"
          value={summaryStats.valid}
          icon={FaQrcode}
          color="orange"
        />
        <SummaryCard
          title="Buka Pemindai"
          value="Scan"
          icon={FaCamera}
          color="purple"
          onClick={() => setIsScannerOpen(true)}
        />
      </div>

      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama atau ID tiket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="Semua">Semua Status</option>
            <option value="valid">Valid</option>
            <option value="sudah_digunakan">Sudah Digunakan</option>
            <option value="hangus">Hangus</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Tiket</th>
                <th>Nama Pelanggan</th>
                <th>Paket Wisata</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <div
                        className="loading-skeleton"
                        style={{
                          height: "2rem",
                          width: "100%",
                          borderRadius: "0.5rem",
                        }}
                      ></div>
                      <p>Memuat data tiket...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <strong className="ticket-id">{ticket.id}</strong>
                    </td>
                    <td className="customer-name">{ticket.namaPelanggan}</td>
                    <td className="package-name">{ticket.paket}</td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="ticket-date">
                      {new Date(ticket.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn action-view"
                          onClick={() => handleViewDetail(ticket)}
                          title="Lihat Detail"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="action-btn action-ticket"
                          onClick={() => handleViewTicket(ticket)}
                          title="Lihat Tiket"
                        >
                          <FaTicketAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <FaTicketAlt className="empty-icon" />
                      <p>Tidak ada data tiket yang cocok dengan pencarian</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onReset={handleResetStatus}
        onVoid={handleVoidTicket}
        onViewTicket={handleViewTicket}
      />

      <TicketPreviewModal
        ticket={selectedTicket}
        isOpen={isTicketPreviewOpen}
        onClose={() => setIsTicketPreviewOpen(false)}
      />

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanValidate={handleScanValidation}
      />
    </div>
  );
}

export default QrPage;