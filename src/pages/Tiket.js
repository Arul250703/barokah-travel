import React from "react";
import { QRCodeSVG } from "qrcode.react";
import "../components/styles/Tiket.css";

const Tiket = ({ participantId, bookingId, nama, namaPaket, telepon }) => {
  // ID peserta dari database
  const qrValue = JSON.stringify({ participant_id: participantId });

  return (
    <div className="tiket-container">
      <div className="tiket-gelang">
        <div className="tiket-kiri">
          <div className="info-atas">
            <span className="kategori-tiket">WISATA</span>
            {/* Booking Code dari backend */}
            <span className="trip-id">Booking: {bookingId}</span>
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

      <div className="trip-id-display">
        <span className="trip-id-label">ID Tiket Peserta:</span>
        <span className="trip-id-code">{participantId}</span>
        <button
          className="copy-id-btn"
          onClick={() => navigator.clipboard.writeText(participantId)}
          title="Copy ID"
        >
          📋
        </button>
      </div>
    </div>
  );
};

export default Tiket;
