import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Link } from "react-router-dom";
import "../components/styles/QrPage.css";
import "../components/styles/ScannerPage.css";

const ScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scannerInstance = null;
    if (isScanning) {
      scannerInstance = new Html5QrcodeScanner(
        "qr-reader-container",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      const onScanSuccess = (decodedText) => {
        setIsScanning(false);
        validateTicket(decodedText);
      };
      scannerInstance.render(onScanSuccess, () => {});
    }
    return () => {
      if (scannerInstance && typeof scannerInstance.clear === "function") {
        scannerInstance.clear().catch(() => {});
      }
    };
  }, [isScanning]);

  const validateTicket = async (decodedText) => {
    displayResult("loading", "MEMPROSES...", "Menghubungi server...");
    try {
      let ticketId;
      try {
        const ticketData = JSON.parse(decodedText);
        ticketId = ticketData.booking_id || ticketData.ticketId || decodedText;
      } catch {
        ticketId = decodedText;
      }

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
        displayResult("success", result.message, result.name);
      } else if (response.status === 409) {
        displayResult("warning", result.message, result.name);
      } else {
        displayResult("error", result.message, result.name);
      }
    } catch (error) {
      displayResult(
        "error",
        "KONEKSI GAGAL",
        "Tidak dapat terhubung ke server."
      );
    }
  };

  const displayResult = (type, message, name) => {
    setScanResult({ type, message, name });
  };

  const handleStartScan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const getResultCardClassName = () =>
    `result-card ${scanResult ? scanResult.type : ""}`;

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

  return (
    <div className="scanner-page">
      <div className="scanner-container">
        <h1>Pemindai Tiket</h1>
        <p>Arahkan kamera ke QR Code pada tiket pelanggan.</p>

        {isScanning && <div id="qr-reader-container"></div>}

        {!isScanning && (
          <button className="start-scan-btn" onClick={handleStartScan}>
            {scanResult ? "Pindai Lagi" : "Mulai Memindai"}
          </button>
        )}

        {scanResult && (
          <>
            <div className={getResultCardClassName()}>
              <div className="icon">{getIcon()}</div>
              <div className="message">{scanResult.message}</div>
              <div className="name">{scanResult.name}</div>
            </div>
            <Link to="/" className="back-to-admin-link">
              Kembali ke Dashboard Admin
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
