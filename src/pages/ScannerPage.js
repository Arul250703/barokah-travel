// src/pages/ScannerPage.js

import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "../components/styles/QrPage.css"; // Pastikan path CSS ini benar

const ScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false); // State untuk mengontrol proses scan

  useEffect(() => {
    let scannerInstance = null;

    // Hanya jalankan scanner jika isScanning bernilai true
    if (isScanning) {
      scannerInstance = new Html5QrcodeScanner(
        "qr-reader-container", // Target div untuk scanner
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false // Verbose logging
      );

      const onScanSuccess = (decodedText, decodedResult) => {
        setIsScanning(false); // Sembunyikan tampilan kamera setelah scan berhasil
        validateTicket(decodedText); // Lanjutkan ke validasi tiket
      };

      const onScanError = (error) => {
        // Bisa diabaikan untuk error minor
      };

      scannerInstance.render(onScanSuccess, onScanError);
    }

    // Fungsi cleanup untuk membersihkan scanner saat komponen ditutup
    return () => {
      if (scannerInstance && scannerInstance.getState() === 2 /* SCANNING */) {
        scannerInstance.clear().catch((error) => {
          console.error("Gagal membersihkan scanner.", error);
        });
      }
    };
  }, [isScanning]); // Jalankan ulang efek ini setiap kali nilai isScanning berubah

  const validateTicket = async (decodedText) => {
    displayResult("loading", "MEMPROSES...", "Menghubungi server...");
    try {
      let ticketId;
      try {
        // Coba parse sebagai JSON terlebih dahulu
        const ticketData = JSON.parse(decodedText);
        ticketId = ticketData.ticketId || decodedText;
      } catch (e) {
        // Jika gagal, anggap sebagai teks biasa
        ticketId = decodedText;
      }

      const response = await fetch("/api/validate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticketId }),
      });
      const result = await response.json();
      if (response.ok) {
        displayResult("success", result.message, `Atas nama: ${result.nama}`);
      } else {
        if (response.status === 409) {
          displayResult("warning", result.message, `Atas nama: ${result.nama}`);
        } else {
          displayResult("error", result.message, `ID Tiket: ${ticketId}`);
        }
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

  // Fungsi untuk memulai atau mengulang scan
  const handleStartScan = () => {
    setScanResult(null); // Hapus hasil scan sebelumnya
    setIsScanning(true); // Tampilkan scanner
  };

  const getResultCardClassName = () => {
    if (!scanResult) return "result-card";
    return `result-card ${scanResult.type}`;
  };

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

        {/* Area ini akan menampilkan kamera jika isScanning true */}
        {isScanning && <div id="qr-reader-container"></div>}

        {/* Tombol ini hanya muncul saat tidak sedang memindai */}
        {!isScanning && (
          <button className="start-scan-btn" onClick={handleStartScan}>
            {scanResult ? "Pindai Lagi" : "Mulai Memindai"}
          </button>
        )}

        {/* Hasil scan akan muncul di bawah */}
        {scanResult && (
          <div className={getResultCardClassName()}>
            {scanResult.type === "loading" ? (
              <>
                <div className="message">{scanResult.message}</div>
                <div className="name">{scanResult.name}</div>
              </>
            ) : (
              <>
                <div className="icon">{getIcon()}</div>
                <div className="message">{scanResult.message}</div>
                <div className="name">{scanResult.name}</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
