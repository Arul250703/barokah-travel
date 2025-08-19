import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Link } from "react-router-dom";
import "../components/styles/QrPage.css"; // Pastikan path ini sesuai dengan struktur proyek Anda
import "../components/styles/ScannerPage.css"; // Pastikan path ini sesuai

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

  // Fungsi validasi ini sekarang berinteraksi dengan localStorage
  const validateTicket = (decodedText) => {
    try {
      let ticketId;
      try {
        const ticketData = JSON.parse(decodedText);
        ticketId = ticketData.ticketId || decodedText;
      } catch {
        ticketId = decodedText;
      }

      // Ambil data tiket dari localStorage
      const allTickets = JSON.parse(localStorage.getItem("allTickets")) || [];
      const targetTicket = allTickets.find((t) => t.id === ticketId);

      if (!targetTicket) {
        displayResult(
          "error",
          "TIKET TIDAK DITEMUKAN",
          `ID Tiket: ${ticketId}`
        );
        return;
      }
      if (targetTicket.status === "sudah_digunakan") {
        displayResult(
          "warning",
          "TIKET SUDAH DIGUNAKAN",
          `Atas nama: ${targetTicket.namaPelanggan}`
        );
        return;
      }
      if (targetTicket.status === "hangus") {
        displayResult(
          "error",
          "TIKET HANGUS/BATAL",
          `Atas nama: ${targetTicket.namaPelanggan}`
        );
        return;
      }

      // Jika valid, update datanya
      const updatedTickets = allTickets.map((t) =>
        t.id === ticketId ? { ...t, status: "sudah_digunakan" } : t
      );

      // Simpan kembali ke localStorage
      localStorage.setItem("allTickets", JSON.stringify(updatedTickets));
      displayResult(
        "success",
        "VALIDASI BERHASIL",
        `Atas nama: ${targetTicket.namaPelanggan}`
      );
    } catch (error) {
      displayResult(
        "error",
        "QR CODE TIDAK VALID",
        "Format data tidak dikenali."
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
