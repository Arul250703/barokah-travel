import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaKeyboard,
  FaHome,
  FaUndo,
  FaStop,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../components/styles/QrPage.css";
import "../components/styles/ScannerPage.css";

const ScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTicketId, setManualTicketId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let scannerInstance = null;

    const initializeScanner = async () => {
      if (isScanning) {
        try {
          const { Html5QrcodeScanner } = await import("html5-qrcode");
          scannerInstance = new Html5QrcodeScanner(
            "qr-reader-container",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              videoConstraints: {
                facingMode: "environment", // Menggunakan kamera belakang
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

          const onScanFailure = (error) => {
            // Handle scan failures silently
            console.log(`Code scan error = ${error}`);
          };

          scannerInstance.render(onScanSuccess, onScanFailure);
          scannerRef.current = scannerInstance;
        } catch (error) {
          console.error("Failed to initialize scanner:", error);
          displayResult(
            "error",
            "INISIALISASI KAMERA GAGAL",
            "Tidak dapat mengakses kamera perangkat. Pastikan Anda memberikan izin kamera."
          );
          setIsScanning(false);
        }
      }
    };

    initializeScanner();

    return () => {
      if (
        scannerRef.current &&
        typeof scannerRef.current.clear === "function"
      ) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  const validateTicket = async (ticketId) => {
    setIsProcessing(true);
    displayResult("loading", "MEMPROSES...", "Menghubungi server...");

    try {
      let processedTicketId;
      try {
        const ticketData = JSON.parse(ticketId);
        processedTicketId =
          ticketData.booking_id || ticketData.ticketId || ticketId;
      } catch {
        processedTicketId = ticketId.trim();
      }

      const response = await fetch(
        "http://localhost:5000/api/tickets/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: processedTicketId }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        displayResult("success", result.message, result.name);
      } else if (response.status === 409) {
        displayResult("warning", result.message, result.name);
      } else {
        displayResult("error", result.message, result.name || "");
      }
    } catch (error) {
      console.error("Validation error:", error);
      displayResult(
        "error",
        "KONEKSI GAGAL",
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const displayResult = (type, message, name) => {
    setScanResult({ type, message, name });
  };

  const handleStartScan = () => {
    setScanResult(null);
    setShowManualInput(false);
    setManualTicketId("");
    setIsScanning(true);
  };

  const handleManualInput = () => {
    setScanResult(null);
    setIsScanning(false);
    setShowManualInput(true);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualTicketId.trim()) {
      setShowManualInput(false);
      validateTicket(manualTicketId.trim());
    }
  };

  const handleCancelManual = () => {
    setShowManualInput(false);
    setManualTicketId("");
  };

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(false);
    setShowManualInput(false);
    setManualTicketId("");

    // Clear scanner instance
    if (scannerRef.current && typeof scannerRef.current.clear === "function") {
      scannerRef.current.clear().catch(() => {});
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);

    // Clear scanner instance
    if (scannerRef.current && typeof scannerRef.current.clear === "function") {
      scannerRef.current.clear().catch(() => {});
    }
  };

  const getResultCardClassName = () =>
    `result-card ${scanResult ? scanResult.type : ""}`;

  const getIcon = () => {
    if (!scanResult) return null;
    switch (scanResult.type) {
      case "success":
        return <FaCheck className="icon" />;
      case "error":
        return <FaTimes className="icon" />;
      case "warning":
        return <FaExclamationTriangle className="icon" />;
      case "loading":
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="scanner-page">
      <div className="scanner-container">
        {/* Header */}
        <div className="header">
          <h1>Pemindai Tiket</h1>
          <p>
            Arahkan kamera ke QR Code pada tiket pelanggan atau masukkan ID
            tiket secara manual.
          </p>
        </div>

        {/* Scanner Area */}
        {isScanning && (
          <div className="scanner-area">
            <div id="qr-reader-container"></div>
            <button
              className="secondary-btn"
              onClick={handleStopScan}
              disabled={isProcessing}
            >
              <FaStop /> Hentikan Pemindaian
            </button>
          </div>
        )}

        {/* Manual Input Area */}
        {showManualInput && (
          <div className="manual-input-area">
            <form className="manual-input-form" onSubmit={handleManualSubmit}>
              <label className="input-label">ID Tiket / Booking ID:</label>
              <input
                type="text"
                className="manual-input"
                value={manualTicketId}
                onChange={(e) => setManualTicketId(e.target.value)}
                placeholder="Masukkan ID tiket atau booking ID"
                disabled={isProcessing}
                autoFocus
              />
              <div className="input-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!manualTicketId.trim() || isProcessing}
                >
                  {isProcessing ? "Memproses..." : "Validasi Tiket"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelManual}
                  disabled={isProcessing}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        {!isScanning && !showManualInput && (
          <div className="action-buttons">
            <button
              className="primary-btn"
              onClick={handleStartScan}
              disabled={isProcessing}
            >
              <FaCamera /> {scanResult ? "Pindai Lagi" : "Mulai Memindai"}
            </button>
            <button
              className="secondary-btn"
              onClick={handleManualInput}
              disabled={isProcessing}
            >
              <FaKeyboard /> Input Manual
            </button>
            {scanResult && (
              <button
                className="secondary-btn"
                onClick={handleReset}
                disabled={isProcessing}
              >
                <FaUndo /> Reset
              </button>
            )}
          </div>
        )}

        {/* Result Display */}
        {scanResult && (
          <div className={getResultCardClassName()}>
            <div className="result-content">
              {scanResult.type === "loading" && (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              )}
              {getIcon()}
              <div className="message">{scanResult.message}</div>
              {scanResult.name && <div className="name">{scanResult.name}</div>}
            </div>
          </div>
        )}

        {/* Navigation */}
        {scanResult && scanResult.type !== "loading" && (
          <div className="navigation">
            <Link to="/" className="primary-btn">
              <FaHome /> Kembali ke Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
