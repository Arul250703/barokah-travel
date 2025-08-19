// src/components/Tiket.js
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import "../components/styles/Tiket.css";

const Tiket = ({ nama, namaPaket, telepon }) => {
  // Generate unique trip ID based on data
  const generateTripId = () => {
    const timestamp = Date.now();
    const nameHash = nama.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `TRP${Math.abs(nameHash).toString().slice(-3)}${timestamp
      .toString()
      .slice(-4)}`;
  };

  const tripId = generateTripId();

  // Enhanced QR data with structured format
  const qrData = {
    ticketId: tripId,
    nama: nama,
    paket: namaPaket,
    telepon: telepon,
    timestamp: Date.now(),
    type: "wisata",
  };

  const qrValue = JSON.stringify(qrData);

  return (
    <div className="tiket-container">
      <div className="tiket-gelang">
        <div className="tiket-kiri">
          <div className="info-atas">
            <span className="kategori-tiket">WISATA</span>
            <span className="trip-id">ID: {tripId}</span>
          </div>
          <div className="info-tengah">
            <span className="nama-paket">{namaPaket}</span>
          </div>
          <div className="info-bawah">
            <span className="nama-peserta">{nama}</span>
            {telepon && <span className="telepon-peserta">{telepon}</span>}
          </div>
        </div>

        <div className="tiket-tengah-separator">
          <div className="separator-line"></div>
          <div className="hole hole-top"></div>
          <div className="hole hole-bottom"></div>
        </div>

        <div className="tiket-kanan">
          <QRCodeSVG
            value={qrValue}
            size={60}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
          <span className="scan-me">SCAN</span>
        </div>
      </div>

      {/* Trip ID Display for Manual Input */}
      <div className="trip-id-display">
        <span className="trip-id-label">ID untuk Input Manual:</span>
        <span className="trip-id-code">{tripId}</span>
        <button
          className="copy-id-btn"
          onClick={() => navigator.clipboard.writeText(tripId)}
          title="Copy ID"
        >
          📋
        </button>
      </div>
    </div>
  );
};

export default Tiket;
