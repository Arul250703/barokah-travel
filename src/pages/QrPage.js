import React, { useState, useMemo, useEffect, useRef } from "react";
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
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "../components/styles/QrPage.css";

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
    if (isProcessing) return;

    setIsProcessing(true);
    setScanResult({ type: "loading", message: "MEMPROSES...", name: "" });

    try {
      let idToValidate;
      let bookingId;

      // Try to parse as JSON first (QR code format)
      try {
        const ticketData = JSON.parse(scannedData);
        idToValidate =
          ticketData.participant_id ||
          ticketData.participantId ||
          ticketData.id;
        bookingId = ticketData.booking_id || ticketData.bookingId;
        console.log("Parsed QR data:", ticketData);
      } catch {
        // If not JSON, treat as plain text ID
        idToValidate = scannedData.toString().trim();
        console.log("Using raw scan data:", idToValidate);
      }

      if (!idToValidate && !bookingId) {
        throw new Error("QR Code tidak berisi ID yang valid.");
      }

      console.log("Validating with data:", {
        participantId: idToValidate,
        bookingId,
      });
      const result = await onScanValidate(idToValidate, bookingId);
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
    DP: { class: "status-dp", label: "DP" },
    Lunas: { class: "status-lunas", label: "Lunas" },
    pending: { class: "status-pending", label: "Pending" },
    scanned: { class: "status-used", label: "Scanned" },
    PENDING: { class: "status-pending", label: "Pending" },
    checked_in: { class: "status-used", label: "Check-in" },
    used: { class: "status-used", label: "Used" },
  };
  const config = statusConfig[status] || {
    class: "status-pending",
    label: status || "Unknown",
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

// Komponen ParticipantScroller untuk scroll horizontal
const ParticipantScroller = ({ participants }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setScrollPosition(scrollLeft);
    }
  };

  useEffect(() => {
    updateScrollButtons();
  }, [participants]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, []);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  if (!participants || participants.length === 0) {
    return (
      <div className="empty-participants">
        <p>Tidak ada data peserta</p>
      </div>
    );
  }

  return (
    <div className="participant-scroller">
      <div className="scroll-container">
        {canScrollLeft && (
          <button
            className="scroll-btn scroll-btn-left"
            onClick={scrollLeft}
            aria-label="Scroll ke kiri"
          >
            <FaChevronLeft />
          </button>
        )}

        <div ref={scrollContainerRef} className="peserta-list-horizontal">
          {participants.map((participant, index) => (
            <div
              key={participant.participant_id || participant.id || index}
              className="peserta-item-horizontal"
            >
              <div className="peserta-info-horizontal">
                <span className="peserta-number">#{index + 1}</span>
                <div className="peserta-details-horizontal">
                  <strong className="peserta-name">
                    {participant.name || `Participant ${index + 1}`}
                  </strong>
                  <span className="peserta-phone">
                    {participant.phone || "-"}
                  </span>
                  <span className="peserta-id">
                    ID:{" "}
                    {participant.participant_id ||
                      participant.id ||
                      `P${index + 1}`}
                  </span>
                </div>
              </div>
              <div className="peserta-status">
                <StatusBadge
                  status={
                    participant.ticket_status || participant.status || "valid"
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            className="scroll-btn scroll-btn-right"
            onClick={scrollRight}
            aria-label="Scroll ke kanan"
          >
            <FaChevronRight />
          </button>
        )}
      </div>

      {participants.length > 3 && (
        <div className="scroll-indicator">
          <span className="scroll-text">
            Geser untuk melihat peserta lainnya ({participants.length} total)
          </span>
        </div>
      )}
    </div>
  );
};

// Komponen TicketDetailModal dengan scroll horizontal
const TicketDetailModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Tanggal tidak valid";

      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(numPrice);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            Detail Booking #
            {booking.booking_id || booking.bookingCode || "Unknown"}
          </h2>
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
                {booking.booking_id || booking.bookingCode || "Unknown"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nama Pelanggan:</span>
              <span className="detail-value">
                {booking.customer_name || "Unknown Customer"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">
                {booking.customer_email || "No email"}
              </span>
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
                {formatDate(booking.booking_date || booking.created_at)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status Pembayaran:</span>
              <StatusBadge
                status={booking.payment_status || booking.status || "pending"}
              />
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Harga:</span>
              <span className="detail-value">
                {formatPrice(booking.total_price)}
              </span>
            </div>
          </div>

          <hr />

          <div className="detail-section">
            <h3>Daftar Peserta ({booking.participants?.length || 0} orang)</h3>
            <ParticipantScroller participants={booking.participants || []} />
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

  // IMPROVED: Enhanced data normalization function
  const normalizeBookingData = (rawBooking) => {
    if (!rawBooking) {
      console.warn("Raw booking is null/undefined");
      return null;
    }

    console.log("Raw booking data:", rawBooking);

    // Extract participants with better field mapping
    let participants = [];

    // Check various possible participant field names
    const participantSources = [
      rawBooking.participants,
      rawBooking.peserta,
      rawBooking.participant_data,
      rawBooking.traveler_data,
      rawBooking.travelers,
      rawBooking.customer_data,
      rawBooking.ticket_holders,
      rawBooking.attendees,
    ];

    for (const source of participantSources) {
      if (Array.isArray(source) && source.length > 0) {
        participants = source;
        console.log("Found participants array:", source);
        break;
      }
    }

    // IMPROVED: Better handling of single participant scenarios
    if (participants.length === 0) {
      // Check if there's participant data embedded in the booking
      const hasParticipantData =
        rawBooking.customer_name ||
        rawBooking.participant_name ||
        rawBooking.nama_peserta ||
        rawBooking.nama;

      if (hasParticipantData) {
        participants = [
          {
            participant_id:
              rawBooking.participant_id ||
              rawBooking.peserta_id ||
              `P1_${rawBooking.booking_id || Date.now()}`,
            name:
              rawBooking.customer_name ||
              rawBooking.participant_name ||
              rawBooking.nama_peserta ||
              rawBooking.nama ||
              "Unknown Participant",
            phone:
              rawBooking.customer_phone ||
              rawBooking.phone ||
              rawBooking.telepon ||
              rawBooking.no_hp ||
              "-",
            email:
              rawBooking.customer_email ||
              rawBooking.email ||
              rawBooking.participant_email ||
              "-",
            ticket_status:
              rawBooking.ticket_status ||
              rawBooking.participant_status ||
              rawBooking.checkin_status ||
              "valid",
          },
        ];
        console.log("Created participant from booking data:", participants[0]);
      }
    }

    // IMPROVED: Better participant normalization with proper status mapping
    const normalizedParticipants = participants
      .map((p, index) => {
        if (!p) return null;

        // Enhanced status mapping
        let ticketStatus = "valid";
        const statusField =
          p.ticket_status ||
          p.status ||
          p.tiket_status ||
          p.checkin_status ||
          p.participant_status;

        if (statusField) {
          // Map various status formats
          const statusMap = {
            checked_in: "sudah_digunakan",
            checkin: "sudah_digunakan",
            scanned: "sudah_digunakan",
            used: "sudah_digunakan",
            valid: "valid",
            pending: "valid",
            expired: "hangus",
            cancelled: "dibatalkan",
            voided: "hangus",
          };

          ticketStatus = statusMap[statusField.toLowerCase()] || statusField;
        }

        return {
          participant_id:
            p.participant_id ||
            p.id ||
            p.peserta_id ||
            p.ticket_id ||
            `P${index + 1}_${Date.now()}`,
          name:
            p.name ||
            p.nama ||
            p.participant_name ||
            p.full_name ||
            `Participant ${index + 1}`,
          phone: p.phone || p.telepon || p.no_hp || p.mobile || "-",
          email: p.email || p.participant_email || "-",
          ticket_status: ticketStatus,
        };
      })
      .filter(Boolean);

    // IMPROVED: Better booking normalization
    const booking_id =
      rawBooking.booking_id ||
      rawBooking.bookingCode ||
      rawBooking.id ||
      rawBooking._id ||
      `BK${Date.now()}`;

    const normalized = {
      id: rawBooking.id || rawBooking._id || booking_id,
      booking_id: booking_id,
      customer_name:
        rawBooking.customer_name ||
        rawBooking.customerName ||
        rawBooking.nama_pelanggan ||
        rawBooking.nama_customer ||
        "Unknown Customer",
      customer_email:
        rawBooking.customer_email ||
        rawBooking.customerEmail ||
        rawBooking.email ||
        "no-email@example.com",
      customer_phone:
        rawBooking.customer_phone ||
        rawBooking.phone ||
        rawBooking.telepon ||
        "-",
      package_name:
        rawBooking.package_name ||
        rawBooking.packageName ||
        rawBooking.nama_paket ||
        rawBooking.tour_package ||
        "Unknown Package",
      payment_status:
        rawBooking.payment_status ||
        rawBooking.status ||
        rawBooking.status_pembayaran ||
        rawBooking.booking_status ||
        "pending",
      total_price: parseFloat(
        rawBooking.total_price ||
          rawBooking.totalPrice ||
          rawBooking.harga_total ||
          rawBooking.price ||
          0
      ),
      booking_date:
        rawBooking.booking_date ||
        rawBooking.created_at ||
        rawBooking.tanggal_booking ||
        rawBooking.date ||
        new Date().toISOString(),
      participants: normalizedParticipants,
    };

    console.log("Normalized booking:", {
      booking_id: normalized.booking_id,
      customer_name: normalized.customer_name,
      participants_count: normalized.participants.length,
      participants_with_status: normalized.participants.map((p) => ({
        name: p.name,
        status: p.ticket_status,
      })),
    });

    return normalized;
  };

  // IMPROVED: Better data fetching with error handling
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching bookings from API...");

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw API Response:", data);

      let rawBookings = [];

      // IMPROVED: Better response format handling
      if (data.success === true && Array.isArray(data.data)) {
        rawBookings = data.data;
        console.log("Using data.data array:", rawBookings.length, "items");
      } else if (data.success === false) {
        throw new Error(data.message || "API returned success: false");
      } else if (Array.isArray(data.bookings)) {
        rawBookings = data.bookings;
        console.log("Using data.bookings array:", rawBookings.length, "items");
      } else if (Array.isArray(data)) {
        rawBookings = data;
        console.log("Using direct array:", rawBookings.length, "items");
      } else if (data.data && typeof data.data === "object") {
        rawBookings = Array.isArray(data.data) ? data.data : [data.data];
        console.log("Using wrapped data:", rawBookings.length, "items");
      } else {
        console.warn("Unexpected API response format:", data);
        // Try to extract any booking-like objects
        if (data.booking) {
          rawBookings = [data.booking];
        } else if (data.result) {
          rawBookings = Array.isArray(data.result)
            ? data.result
            : [data.result];
        } else {
          rawBookings = [];
        }
      }

      console.log("Raw bookings before normalization:", rawBookings);

      if (rawBookings.length === 0) {
        console.warn("No bookings found in API response");
      }

      // Normalize semua booking data
      const normalizedBookings = rawBookings
        .map(normalizeBookingData)
        .filter(Boolean);

      console.log("Final normalized bookings:", normalizedBookings);
      setBookings(normalizedBookings);
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

  // IMPROVED: Fixed handleScanValidation function
  const handleScanValidation = async (participantId, bookingId) => {
    try {
      console.log("Validating scan:", { participantId, bookingId });

      // Prepare request body based on available data
      const requestBody = {};
      if (participantId) requestBody.participantId = participantId;
      if (bookingId) requestBody.bookingId = bookingId;

      if (!participantId && !bookingId) {
        throw new Error("Participant ID atau Booking ID harus ada");
      }

      const response = await fetch("http://localhost:5000/api/bookings/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Validation response status:", response.status);

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Response tidak valid dari server");
      }

      console.log("Validation result:", result);

      if (response.ok) {
        // Refresh data setelah validasi berhasil
        setTimeout(() => fetchBookings(), 500);
        return {
          type: "success",
          message: result.message || "VALIDASI BERHASIL",
          name:
            result.name || result.customerName || result.participant_name || "",
        };
      } else {
        let type = "error";
        if (response.status === 409) {
          type = "warning";
        } else if (response.status === 410) {
          type = "error";
        } else if (response.status === 404) {
          type = "error";
        } else if (response.status >= 500) {
          type = "error";
        }

        return {
          type: type,
          message: result.message || "VALIDASI GAGAL",
          name:
            result.name || result.customerName || result.participant_name || "",
        };
      }
    } catch (error) {
      console.error("Network error during validation:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        return {
          type: "error",
          message: "KONEKSI GAGAL",
          name: "Tidak dapat terhubung ke server. Periksa koneksi internet dan pastikan server berjalan.",
        };
      }

      return {
        type: "error",
        message: "KESALAHAN SISTEM",
        name: error.message || "Terjadi kesalahan tidak terduga",
      };
    }
  };

  // IMPROVED: Enhanced filtering
  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          (booking.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            booking.booking_id
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            booking.package_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())) &&
          (filterStatus === "Semua" || booking.payment_status === filterStatus)
      ),
    [bookings, searchTerm, filterStatus]
  );

  // IMPROVED: Enhanced summary stats calculation with proper participant counting
  const summaryStats = useMemo(() => {
    console.log("Calculating summary stats for bookings:", bookings);

    let checkedIn = 0;
    let valid = 0;
    let totalParticipants = 0;
    let totalBookings = bookings.length;

    bookings.forEach((booking, bookingIndex) => {
      console.log(`Processing booking ${bookingIndex + 1}:`, {
        booking_id: booking.booking_id,
        customer_name: booking.customer_name,
        participants_count: booking.participants?.length || 0,
        payment_status: booking.payment_status,
      });

      if (booking.participants && Array.isArray(booking.participants)) {
        const participantCount = booking.participants.length;
        totalParticipants += participantCount;

        booking.participants.forEach((participant, participantIndex) => {
          const status =
            participant.ticket_status || participant.status || "valid";
          console.log(`  Participant ${participantIndex + 1}:`, {
            name: participant.name,
            id: participant.participant_id,
            status: status,
          });

          // Count valid tickets (not checked in yet)
          if (status === "valid" || status === "pending") {
            valid++;
          }

          // Count checked in participants
          if (
            status === "sudah_digunakan" ||
            status === "scanned" ||
            status === "checked_in" ||
            status === "used"
          ) {
            checkedIn++;
          }
        });
      } else {
        // If no participants array, assume 1 participant from booking data
        console.log(
          `  No participants array, using booking data as single participant`
        );
        totalParticipants += 1;

        // Check if this single participant is checked in based on booking status
        const bookingStatus = booking.payment_status || "pending";
        if (bookingStatus === "selesai" || bookingStatus === "Lunas") {
          valid += 1;
        }
      }
    });

    const stats = {
      totalBookings: totalBookings,
      totalParticipants: totalParticipants,
      checkedIn: checkedIn,
      valid: valid,
    };

    console.log("Final summary stats:", stats);
    return stats;
  }, [bookings]);

  // IMPROVED: Better detail view handler
  const handleViewDetail = (booking) => {
    console.log("Opening detail for booking:", booking);
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  // IMPROVED: Fixed ticket view navigation
  const handleViewTicket = (booking) => {
    console.log("Navigating to ticket:", booking.booking_id);

    if (!booking.booking_id) {
      alert("ID Booking tidak tersedia");
      return;
    }

    try {
      // Navigate to ticket detail page
      navigate(`/tiket/${booking.booking_id}`);
    } catch (navigationError) {
      console.error("Navigation error:", navigationError);
      // Show error message instead of trying fallback routes
      alert(
        "Gagal membuka halaman tiket. Pastikan routing sudah dikonfigurasi dengan benar."
      );
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing bookings data...");
    fetchBookings();
  };

  // IMPROVED: Better participant counting with proper status recognition
  const getParticipantCounts = (booking) => {
    if (!booking.participants || !Array.isArray(booking.participants)) {
      console.log("No participants array for booking:", booking.booking_id);
      // If no participants array but has customer data, assume 1 participant
      if (booking.customer_name) {
        const isCheckedIn =
          booking.payment_status === "selesai" ||
          booking.payment_status === "Lunas";
        return {
          checkedIn: isCheckedIn ? 1 : 0,
          total: 1,
        };
      }
      return { checkedIn: 0, total: 0 };
    }

    const total = booking.participants.length;
    const checkedIn = booking.participants.filter((p) => {
      const status = p.ticket_status || p.status || "valid";
      return (
        status === "sudah_digunakan" ||
        status === "scanned" ||
        status === "checked_in" ||
        status === "used"
      );
    }).length;

    const result = { checkedIn, total };
    console.log(`Participant counts for ${booking.booking_id}:`, result);
    return result;
  };

  // IMPROVED: Better status display formatting
  const formatParticipantStatus = (checkedIn, total) => {
    if (total === 0) return "0 / 0";

    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return (
      <span
        className={`participant-status ${
          checkedIn === total && total > 0 ? "all-checked" : ""
        }`}
      >
        {checkedIn} / {total}
        {total > 0 && (
          <small className="status-percentage"> ({percentage}%)</small>
        )}
      </span>
    );
  };

  return (
    <div className="qr-page-container">
      <div className="content-header">
        <div className="header-left">
          <div className="page-title">
            <h1>Manajemen Tiket</h1>
            <p>Monitor, kelola, dan validasi tiket pelanggan</p>
          </div>
        </div>
        <div className="header-right">
          {error && (
            <div className="error-banner">
              <FaExclamationTriangle />
              <span>{error}</span>
              <button onClick={handleRefresh} className="retry-btn">
                Coba Lagi
              </button>
            </div>
          )}
          <div className="user-profile">
            <div className="profile-avatar">
              <FaUsers />
            </div>
            <span className="profile-name">Admin</span>
            <FaChevronDown className="profile-dropdown" />
          </div>
        </div>
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
            placeholder="Cari nama, ID booking, atau paket..."
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
            <option value="Lunas">Lunas</option>
            <option value="menunggu_pembayaran">Pending</option>
            <option value="pending">Pending</option>
            <option value="PENDING">Pending</option>
            <option value="DP">DP</option>
            <option value="dibatalkan">Batal</option>
            <option value="gagal">Gagal</option>
          </select>
          <FaChevronDown className="filter-icon" />
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">
            <h3>
              Daftar Booking ({filteredBookings.length} dari {bookings.length})
            </h3>
          </div>
          <button
            className="btn btn-refresh"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh Data"
          >
            <FaSpinner className={isLoading ? "spinning" : ""} />
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

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
                filteredBookings.map((booking, index) => {
                  const { checkedIn, total } = getParticipantCounts(booking);

                  return (
                    <tr key={booking.id || booking.booking_id || index}>
                      <td>
                        <strong className="ticket-id">
                          {booking.booking_id}
                        </strong>
                        <small className="booking-index">#{index + 1}</small>
                      </td>
                      <td className="customer-name">
                        <div className="customer-info">
                          <strong>{booking.customer_name}</strong>
                          {booking.customer_phone &&
                            booking.customer_phone !== "-" && (
                              <small className="customer-phone">
                                {booking.customer_phone}
                              </small>
                            )}
                        </div>
                      </td>
                      <td className="package-name">{booking.package_name}</td>
                      <td>
                        <StatusBadge status={booking.payment_status} />
                      </td>
                      <td className="participant-count">
                        {formatParticipantStatus(checkedIn, total)}
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
                    <p>Tidak ada data booking ditemukan</p>
                    <p className="empty-subtitle">
                      {searchTerm || filterStatus !== "Semua"
                        ? "Coba ubah filter pencarian"
                        : "Belum ada booking yang tersedia"}
                    </p>
                    {error && (
                      <button
                        className="btn btn-primary mt-2"
                        onClick={handleRefresh}
                      >
                        Coba Lagi
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug Info Panel (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="debug-panel">
          <details>
            <summary>Debug Info</summary>
            <div className="debug-content">
              <p>
                <strong>Total bookings loaded:</strong> {bookings.length}
              </p>
              <p>
                <strong>Filtered bookings:</strong> {filteredBookings.length}
              </p>
              <p>
                <strong>Search term:</strong> "{searchTerm}"
              </p>
              <p>
                <strong>Filter status:</strong> {filterStatus}
              </p>
              <p>
                <strong>Summary stats:</strong>
              </p>
              <ul>
                <li>Total Bookings: {summaryStats.totalBookings}</li>
                <li>Total Participants: {summaryStats.totalParticipants}</li>
                <li>Checked In: {summaryStats.checkedIn}</li>
                <li>Valid: {summaryStats.valid}</li>
              </ul>
              {bookings.length > 0 && (
                <details>
                  <summary>Sample booking data</summary>
                  <pre>{JSON.stringify(bookings[0], null, 2)}</pre>
                </details>
              )}
            </div>
          </details>
        </div>
      )}

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanValidate={handleScanValidation}
      />

      {/* Detail Modal */}
      <TicketDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
}

export default QrPage;
