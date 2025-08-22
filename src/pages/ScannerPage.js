import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaKeyboard,
  FaHome,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaStop,
  FaUndo,
} from "react-icons/fa";
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
              videoConstraints: { facingMode: "environment" },
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
          displayResult(
            "error",
            "INISIALISASI KAMERA GAGAL",
            "Pastikan Anda memberikan izin kamera."
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

  const validateTicket = async (scannedData) => {
    setIsProcessing(true);
    displayResult("loading", "MEMPROSES...", "Menghubungi server...");
    try {
      let idToValidate;
      try {
        const ticketData = JSON.parse(scannedData);
        idToValidate = ticketData.participant_id;
      } catch {
        idToValidate = scannedData.trim();
      }
      if (!idToValidate) {
        throw new Error("Format QR Code tidak valid.");
      }
      const response = await fetch(
        "http://localhost:5000/api/tickets/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId: idToValidate }),
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
      displayResult(
        "error",
        "KONEKSI GAGAL",
        "Tidak dapat terhubung ke server."
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

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(false);
    setShowManualInput(false);
    setManualTicketId("");
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
      default:
        return null;
    }
  };

  return (
    <div className="scanner-page">
      <div className="scanner-container">
        <div className="header">
          <h1>Pemindai Tiket</h1>
          <p>
            Arahkan kamera ke QR Code atau masukkan ID tiket peserta secara
            manual.
          </p>
        </div>

        {isScanning && (
          <div className="scanner-area">
            <div id="qr-reader-container"></div>
            <button
              className="secondary-btn"
              onClick={() => setIsScanning(false)}
              disabled={isProcessing}
            >
              <FaStop /> Hentikan
            </button>
          </div>
        )}

        {showManualInput && (
          <div className="manual-input-area">
            <form className="manual-input-form" onSubmit={handleManualSubmit}>
              <input
                type="text"
                className="manual-input"
                value={manualTicketId}
                onChange={(e) => setManualTicketId(e.target.value)}
                placeholder="Masukkan ID tiket peserta..."
                disabled={isProcessing}
                autoFocus
              />
              <button
                type="submit"
                className="submit-btn"
                disabled={!manualTicketId.trim() || isProcessing}
              >
                {isProcessing ? "Memproses..." : "Validasi Tiket"}
              </button>
            </form>
          </div>
        )}

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
          </div>
        )}

        {scanResult && (
          <div className={getResultCardClassName()}>
            <div className="result-content">
              {getIcon()}
              <div className="message">{scanResult.message}</div>
              {scanResult.name && <div className="name">{scanResult.name}</div>}
            </div>
          </div>
        )}

        {(scanResult || showManualInput || isScanning) && (
          <div className="navigation">
            <button
              className="primary-btn reset-btn"
              onClick={handleReset}
              disabled={isProcessing}
            >
              <FaUndo /> Reset
            </button>
            <Link to="/" className="secondary-btn">
              <FaHome /> Ke Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
