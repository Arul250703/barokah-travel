import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaQrcode,
  FaSearch,
  FaCheckCircle,
  FaTicketAlt,
  FaEye,
  FaCamera,
  FaTimes,
  FaChevronDown,
  FaKeyboard,
  FaCheck,
  FaExclamationTriangle,
  FaUsers,
  FaSpinner,
} from "react-icons/fa";
import "../components/styles/QrPage.css";
import "../components/styles/ScannerPage.css";

// Komponen Scanner Modal yang menerima callback
const ScannerModal = ({ isOpen, onClose, onScanValidate }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let scannerInstance = null;
    if (isOpen && isScanning && activeTab === "scan") {
      import("html5-qrcode")
        .then(({ Html5QrcodeScanner }) => {
          scannerInstance = new Html5QrcodeScanner(
            "qr-reader-container-modal",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
          const onScanSuccess = (decodedText) => {
            console.log("QR Code berhasil dipindai:", decodedText);
            setIsScanning(false);
            validateTicket(decodedText);
          };
          const onScanError = (errorMessage) => {
            // Tidak perlu console.error untuk error scanning normal
          };
          scannerInstance.render(onScanSuccess, onScanError);
        })
        .catch((err) => {
          console.error("Error loading QR scanner:", err);
          setScanResult({
            type: "error",
            message: "Gagal memuat scanner. Pastikan browser mendukung kamera.",
          });
        });
    }
    return () => {
      if (scannerInstance && typeof scannerInstance.clear === "function") {
        scannerInstance.clear().catch((err) => {
          console.log("Error clearing scanner:", err);
        });
      }
    };
  }, [isOpen, isScanning, activeTab]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("scan");
      setScanResult(null);
      setManualInput("");
      setIsScanning(true);
      setIsProcessing(false);
    } else {
      setIsScanning(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const validateTicket = async (scannedData) => {
    if (isProcessing) return; // Prevent multiple simultaneous validations

    setIsProcessing(true);
    setScanResult({ type: "loading", message: "MEMPROSES...", name: "" });

    try {
      let idToValidate;

      // Try to parse as JSON first (QR code format)
      try {
        const ticketData = JSON.parse(scannedData);
        idToValidate = ticketData.participant_id || ticketData.id;
        console.log("Parsed QR data:", ticketData);
      } catch {
        // If not JSON, treat as plain text ID
        idToValidate = scannedData.toString().trim();
        console.log("Using raw scan data:", idToValidate);
      }

      if (!idToValidate) {
        throw new Error("QR Code tidak berisi ID peserta yang valid.");
      }

      console.log("Validating participant ID:", idToValidate);
      const result = await onScanValidate(idToValidate);
      setScanResult(result);
    } catch (err) {
      console.error("Validation error:", err);
      setScanResult({
        type: "error",
        message: err.message || "QR Code tidak valid atau terjadi kesalahan.",
        name: "",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim() || isProcessing) return;
    validateTicket(manualInput.trim());
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
      case "loading":
        return <FaSpinner className="result-icon spinning" />;
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
          <div className="scanner-toggle">
            <button
              className={`toggle-btn ${activeTab === "scan" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("scan");
                setScanResult(null);
                setManualInput("");
              }}
              disabled={isProcessing}
            >
              <FaCamera /> Scan QR Code
            </button>
            <button
              className={`toggle-btn ${activeTab === "manual" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("manual");
                setScanResult(null);
                setIsScanning(false);
              }}
              disabled={isProcessing}
            >
              <FaKeyboard /> Input Manual
            </button>
          </div>

          {activeTab === "scan" ? (
            <>
              <div className="scanner-container">
                {isScanning && <div id="qr-reader-container-modal"></div>}
                {!isScanning && !isProcessing && (
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
              <p className="manual-input-title">Masukkan ID Tiket Peserta</p>
              <form onSubmit={handleManualSubmit} className="manual-input-form">
                <input
                  type="text"
                  placeholder="Masukkan ID tiket..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="manual-input"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  className="manual-input-btn"
                  disabled={isProcessing || !manualInput.trim()}
                >
                  {isProcessing ? "Validasi..." : "Validasi"}
                </button>
              </form>
            </div>
          )}

          {scanResult && (
            <div className={getResultCardClassName()}>
              {scanResult.type === "loading" ? (
                <>
                  {getIcon()}
                  <div className="result-message">{scanResult.message}</div>
                </>
              ) : (
                <>
                  {getIcon()}
                  <div className="result-content">
                    <div className="result-message">{scanResult.message}</div>
                    {scanResult.name && (
                      <div className="result-details">{scanResult.name}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponen StatusBadge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    selesai: { class: "status-valid", label: "Lunas" },
    menunggu_pembayaran: { class: "status-pending", label: "Pending" },
    dibatalkan: { class: "status-voided", label: "Batal" },
    gagal: { class: "status-error", label: "Gagal" },
    valid: { class: "status-valid", label: "Valid" },
    sudah_digunakan: { class: "status-used", label: "Used" },
    hangus: { class: "status-voided", label: "Hangus" },
  };
  const config = statusConfig[status] || {
    class: "status-pending",
    label: status,
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
const TicketDetailModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detail Booking #{booking.booking_id}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h3>Informasi Booking</h3>
            <div className="detail-row">
              <span className="detail-label">ID Booking:</span>
              <span className="detail-value booking-id">
                {booking.booking_id}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nama Pelanggan:</span>
              <span className="detail-value">{booking.customer_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{booking.customer_email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Paket Wisata:</span>
              <span className="detail-value">
                {booking.package_name || "N/A"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tgl. Booking:</span>
              <span className="detail-value">
                {new Date(booking.booking_date).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status Pembayaran:</span>
              <StatusBadge status={booking.payment_status} />
            </div>
            {booking.total_price && (
              <div className="detail-row">
                <span className="detail-label">Total Harga:</span>
                <span className="detail-value">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(booking.total_price)}
                </span>
              </div>
            )}
          </div>

          <hr />

          <div className="detail-section">
            <h3>Daftar Peserta ({booking.participants?.length || 0} orang)</h3>
            <div className="peserta-list">
              {booking.participants && booking.participants.length > 0 ? (
                booking.participants.map((participant, index) => (
                  <div
                    key={participant.participant_id}
                    className="peserta-item"
                  >
                    <div className="peserta-info">
                      <span className="peserta-number">#{index + 1}</span>
                      <div className="peserta-details">
                        <strong className="peserta-name">
                          {participant.name}
                        </strong>
                        <span className="peserta-phone">
                          ({participant.phone})
                        </span>
                        <span className="peserta-id">
                          ID: {participant.participant_id}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={participant.ticket_status} />
                  </div>
                ))
              ) : (
                <div className="empty-participants">
                  <p>Tidak ada data peserta</p>
                </div>
              )}
            </div>
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

// Komponen Utama Halaman Admin
function QrPage() {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching bookings from API...");

      const response = await fetch("http://localhost:5000/api/bookings");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Pastikan data yang diterima dari backend adalah array
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
        console.log("Bookings loaded successfully:", data.data.length, "items");
      } else if (Array.isArray(data)) {
        // Fallback jika response langsung array
        setBookings(data);
      } else {
        console.warn("Unexpected API response format:", data);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(`Gagal mengambil data: ${error.message}`);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleScanValidation = async (participantId) => {
    try {
      console.log("Validating participant:", participantId);

      // PERBAIKAN: Ganti URL endpoint yang benar
      const response = await fetch(
        "http://localhost:5000/api/validate-participant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ participantId }),
        }
      );

      console.log("Validation response status:", response.status);
      const result = await response.json();
      console.log("Validation result:", result);

      if (response.ok) {
        // Refresh data setelah validasi berhasil
        fetchBookings();
        return {
          type: "success",
          message: result.message || "VALIDASI BERHASIL",
          name: result.name || "",
        };
      } else {
        // Handle different error types
        let type = "error";
        if (response.status === 409) {
          type = "warning"; // Tiket sudah digunakan
        } else if (response.status === 410) {
          type = "error"; // Tiket hangus
        } else if (response.status === 404) {
          type = "error"; // Tiket tidak ditemukan
        }

        return {
          type: type,
          message: result.message || "VALIDASI GAGAL",
          name: result.name || "",
        };
      }
    } catch (error) {
      console.error("Network error during validation:", error);
      return {
        type: "error",
        message: "KONEKSI GAGAL",
        name: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      };
    }
  };

  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          (booking.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            booking.booking_id
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())) &&
          (filterStatus === "Semua" || booking.payment_status === filterStatus)
      ),
    [bookings, searchTerm, filterStatus]
  );

  const summaryStats = useMemo(() => {
    let checkedIn = 0;
    let valid = 0;
    let totalParticipants = 0;

    bookings.forEach((booking) => {
      if (booking.participants && Array.isArray(booking.participants)) {
        totalParticipants += booking.participants.length;
        booking.participants.forEach((participant) => {
          if (participant.ticket_status === "valid") valid++;
          if (participant.ticket_status === "sudah_digunakan") checkedIn++;
        });
      }
    });

    return {
      totalBookings: bookings.length,
      totalParticipants: totalParticipants,
      checkedIn: checkedIn,
      valid: valid,
    };
  }, [bookings]);

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleViewTicket = (booking) => {
    navigate(`/tiket/${booking.booking_id}`);
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  return (
    <div className="qr-page-container">
      <div className="content-header">
        <h1>Manajemen Tiket</h1>
        <p>Monitor, kelola, dan validasi tiket pelanggan.</p>
        {error && (
          <div className="error-banner">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button onClick={handleRefresh} className="retry-btn">
              Coba Lagi
            </button>
          </div>
        )}
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Total Booking"
          value={summaryStats.totalBookings}
          icon={FaTicketAlt}
          color="blue"
        />
        <SummaryCard
          title="Total Peserta"
          value={summaryStats.totalParticipants}
          icon={FaUsers}
          color="purple"
        />
        <SummaryCard
          title="Sudah Check-in"
          value={summaryStats.checkedIn}
          icon={FaCheckCircle}
          color="green"
        />
        <SummaryCard
          title="Tiket Valid"
          value={summaryStats.valid}
          icon={FaQrcode}
          color="orange"
        />
        <SummaryCard
          title="Buka Pemindai"
          value="Scan"
          icon={FaCamera}
          color="red"
          onClick={() => setIsScannerOpen(true)}
        />
      </div>

      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama atau ID booking..."
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
            <option value="Semua">Semua Status Pembayaran</option>
            <option value="selesai">Lunas</option>
            <option value="menunggu_pembayaran">Pending</option>
            <option value="dibatalkan">Batal</option>
            <option value="gagal">Gagal</option>
          </select>
          <FaChevronDown className="filter-icon" />
        </div>
        <button
          onClick={handleRefresh}
          className="refresh-btn"
          disabled={isLoading}
        >
          {isLoading ? <FaSpinner className="spinning" /> : "Refresh"}
        </button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Booking</th>
                <th>Nama Pelanggan</th>
                <th>Paket Wisata</th>
                <th>Status Pembayaran</th>
                <th>Peserta (Check-in/Total)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <FaSpinner className="spinning" />
                    <p>Memuat data...</p>
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const checkedInCount =
                    booking.participants?.filter(
                      (p) => p.ticket_status === "sudah_digunakan"
                    ).length || 0;
                  const totalCount = booking.participants?.length || 0;

                  return (
                    <tr key={booking.id || booking.booking_id}>
                      <td>
                        <strong className="ticket-id">
                          {booking.booking_id}
                        </strong>
                      </td>
                      <td className="customer-name">{booking.customer_name}</td>
                      <td className="package-name">
                        {booking.package_name || "N/A"}
                      </td>
                      <td>
                        <StatusBadge status={booking.payment_status} />
                      </td>
                      <td className="participant-count">
                        <span
                          className={
                            checkedInCount === totalCount && totalCount > 0
                              ? "all-checked"
                              : ""
                          }
                        >
                          {checkedInCount} / {totalCount}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn action-view"
                            onClick={() => handleViewDetail(booking)}
                            title="Lihat Detail"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="action-btn action-ticket"
                            onClick={() => handleViewTicket(booking)}
                            title="Lihat Tiket"
                          >
                            <FaTicketAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <FaTicketAlt />
                    <p>
                      {searchTerm || filterStatus !== "Semua"
                        ? "Tidak ada data booking yang sesuai dengan filter."
                        : "Belum ada data booking."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterStatus("Semua");
                        }}
                        className="clear-filter-btn"
                      >
                        Hapus Filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TicketDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBooking(null);
        }}
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
