import React, { useState, useMemo, useEffect } from "react";
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
} from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import "../components/styles/QrPage.css";
import "../components/styles/ScannerPage.css";

// Simulasi data tiket awal
const initialTickets = [
  {
    id: "TRX001",
    namaPelanggan: "Budi Santoso",
    email: "budi.s@example.com",
    paket: "Sukabumi 2H1M",
    status: "valid",
    tanggal: "2025-08-15T09:00:00Z",
    peserta: [{ nama: "Budi Santoso", telepon: "081234567890" }],
  },
  {
    id: "TRX002",
    namaPelanggan: "Ani Lestari",
    email: "ani.l@example.com",
    paket: "Yogyakarta 3H2M",
    status: "sudah_digunakan",
    tanggal: "2025-08-15T09:05:12Z",
    peserta: [
      { nama: "Ani Lestari", telepon: "081234567891" },
      { nama: "Rudi Hartono", telepon: "081234567892" },
    ],
  },
  {
    id: "TRX003",
    namaPelanggan: "Sari Indah",
    email: "sari.i@example.com",
    paket: "Bali 5H4M",
    status: "hangus",
    tanggal: "2025-08-10T14:30:00Z",
    peserta: [{ nama: "Sari Indah", telepon: "081234567893" }],
  },
  {
    id: "TRX004",
    namaPelanggan: "Ahmad Rahman",
    email: "ahmad.r@example.com",
    paket: "Jakarta City Tour",
    status: "valid",
    tanggal: "2025-08-16T10:30:00Z",
    peserta: [
      { nama: "Ahmad Rahman", telepon: "081234567894" },
      { nama: "Siti Nurhaliza", telepon: "081234567895" },
    ],
  },
];

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

  useEffect(() => {
    let scannerInstance = null;
    if (isOpen && isScanning) {
      import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
        scannerInstance = new Html5QrcodeScanner(
          "qr-reader-container-modal",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        const onScanSuccess = (decodedText) => {
          setIsScanning(false);
          validateTicket(decodedText);
        };

        scannerInstance.render(onScanSuccess, () => {});
      });
    }

    return () => {
      if (scannerInstance && typeof scannerInstance.clear === "function") {
        scannerInstance.clear().catch(() => {});
      }
    };
  }, [isOpen, isScanning]);

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setIsScanning(true);
    } else {
      setIsScanning(false);
      setScanResult(null);
    }
  }, [isOpen]);

  const validateTicket = (decodedText) => {
    setScanResult({
      type: "loading",
      message: "MEMPROSES...",
      name: "Memvalidasi data tiket...",
    });
    try {
      let ticketId;
      try {
        const ticketData = JSON.parse(decodedText);
        ticketId = ticketData.ticketId || decodedText;
      } catch {
        ticketId = decodedText;
      }
      const result = onScanValidate(ticketId);
      setScanResult(result);
    } catch {
      setScanResult({
        type: "error",
        message: "QR CODE TIDAK VALID",
        name: "Format data tidak dikenali.",
      });
    }
  };

  const getResultCardClassName = () =>
    `scan-result ${scanResult ? scanResult.type : ""}`;
  const getIcon = () => {
    if (!scanResult) return null;
    switch (scanResult.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return null;
    }
  };
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-scanner" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Pindai Tiket QR Code</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {isScanning && <div id="qr-reader-container-modal"></div>}
          {!isScanning && (
            <button
              className="start-scan-btn"
              onClick={() => {
                setScanResult(null);
                setIsScanning(true);
              }}
            >
              {scanResult ? "Pindai Lagi" : "Mulai Memindai"}
            </button>
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
                  <div className="result-icon">{getIcon()}</div>
                  <div className="result-message">{scanResult.message}</div>
                  <div className="result-details">{scanResult.name}</div>
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
            <span className="detail-label">Status:</span>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="detail-row">
            <span className="detail-label">Peserta:</span>
            <div className="peserta-list">
              {ticket.peserta.map((p, index) => (
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
          >
            <FaUndo /> Reset Status
          </button>
          <button className="btn btn-danger" onClick={() => onVoid(ticket.id)}>
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
            {ticket.peserta.map((p, index) => (
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
      </div>
    </div>
  );
};

// Komponen Utama Halaman Admin
function QrPage() {
  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem("allTickets");
    return savedTickets ? JSON.parse(savedTickets) : initialTickets;
  });

  useEffect(() => {
    localStorage.setItem("allTickets", JSON.stringify(tickets));
  }, [tickets]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTicketPreviewOpen, setIsTicketPreviewOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const filteredTickets = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (t.namaPelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
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

  const handleResetStatus = (ticketId) => {
    if (window.confirm('Reset status tiket ini menjadi "valid"?')) {
      setTickets(
        tickets.map((t) => (t.id === ticketId ? { ...t, status: "valid" } : t))
      );
      setIsDetailModalOpen(false);
    }
  };

  const handleVoidTicket = (ticketId) => {
    if (window.confirm("Batalkan (void) tiket ini?")) {
      setTickets(
        tickets.map((t) => (t.id === ticketId ? { ...t, status: "hangus" } : t))
      );
      setIsDetailModalOpen(false);
    }
  };

  const handleScanValidation = (ticketId) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);

    if (!targetTicket) {
      return {
        type: "error",
        message: "TIKET TIDAK DITEMUKAN",
        name: `ID Tiket: ${ticketId}`,
      };
    }

    if (targetTicket.status === "sudah_digunakan") {
      return {
        type: "warning",
        message: "TIKET SUDAH DIGUNAKAN",
        name: `Atas nama: ${targetTicket.namaPelanggan}`,
      };
    }

    if (targetTicket.status === "hangus") {
      return {
        type: "error",
        message: "TIKET HANGUS/BATAL",
        name: `Atas nama: ${targetTicket.namaPelanggan}`,
      };
    }

    if (targetTicket.status === "valid") {
      setTickets(
        tickets.map((t) =>
          t.id === ticketId ? { ...t, status: "sudah_digunakan" } : t
        )
      );
      return {
        type: "success",
        message: "VALIDASI BERHASIL",
        name: `Atas nama: ${targetTicket.namaPelanggan}`,
      };
    }

    return {
      type: "error",
      message: "STATUS TIKET TIDAK DIKENALI",
      name: `Atas nama: ${targetTicket.namaPelanggan}`,
    };
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
              {filteredTickets.length > 0 ? (
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
