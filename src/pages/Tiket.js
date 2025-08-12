// src/components/Tiket.js

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import "../components/styles/Tiket.css"; // File CSS khusus untuk tiket

const Tiket = ({ nama, namaPaket }) => {
  // Data yang akan di-encode dalam QR Code
  const qrValue = `Nama: ${nama}\nPaket: ${namaPaket}`;

  return (
    <div className="tiket-gelang">
      <div className="tiket-kiri">
        <div className="info-atas">
          <span className="kategori-tiket">WISATA</span>
          <span className="nama-paket">{namaPaket}</span>
        </div>
        <div className="info-bawah">
          <span className="nama-peserta">{nama}</span>
        </div>
      </div>
      <div className="tiket-kanan">
        <QRCodeSVG
          value={qrValue}
          size={64}
          bgColor="#ffffff"
          fgColor="#000000"
        />
        <span className="scan-me">SCAN ME</span>
      </div>
    </div>
  );
};

export default Tiket;
