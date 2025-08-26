// src/pages/TiketPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Tiket from "./Tiket"; // Pastikan path ini benar
import "../components/styles/TiketPage.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TiketPage = () => {
  // --- PERUBAHAN UTAMA: Mengambil data dari URL, bukan state ---
  const { bookingId } = useParams();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Fungsi untuk mengambil detail booking dari backend
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/bookings/${bookingId}`
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Booking tidak ditemukan.");
        }
        const data = await response.json();
        setBookingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  // Fungsi untuk download PDF semua tiket
  const downloadAllTicketsPDF = async () => {
    if (!bookingData) return;

    setIsDownloading(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const ticketElements = document.querySelectorAll(".tiket-container");
      let isFirstPage = true;

      for (let i = 0; i < ticketElements.length; i++) {
        if (!isFirstPage) {
          pdf.addPage();
        }

        const element = ticketElements[i];
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Center the ticket on the page
        const x = (210 - imgWidth) / 2;
        const y = 20;

        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

        isFirstPage = false;
      }

      pdf.save(
        `Tiket_${bookingData.booking_id}_${bookingData.package_name}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Fungsi untuk download PDF tiket individual
  const downloadSingleTicketPDF = async (participantId) => {
    if (!bookingData) return;

    setIsDownloading(true);

    try {
      const ticketElement = document.querySelector(
        `[data-participant-id="${participantId}"] .tiket-container`
      );

      if (!ticketElement) {
        alert("Tiket tidak ditemukan");
        return;
      }

      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Center the ticket on the page
      const x = (210 - imgWidth) / 2;
      const y = 20;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      const participant = bookingData.participants.find(
        (p) => p.participant_id === participantId
      );
      const fileName = `Tiket_${participant?.name || participantId}_${
        bookingData.package_name
      }.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Tampilan saat data sedang dimuat
  if (loading) {
    return (
      <div className="tiket-page-container">
        <div className="tiket-page-content">
          <h1>Memuat data tiket...</h1>
        </div>
      </div>
    );
  }

  // Tampilan jika terjadi error
  if (error) {
    return (
      <div className="tiket-page-container">
        <div className="tiket-page-content">
          <h1>Oops! Terjadi Kesalahan</h1>
          <p>{error}</p>
          <Link to="/" className="back-to-home-link">
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  // Tampilan jika data tidak ditemukan
  if (!bookingData) {
    return (
      <div className="tiket-page-container">
        <div className="tiket-page-content">
          <h1>Data booking tidak ditemukan.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="tiket-page-container">
      <div className="tiket-page-content loaded">
        <h1 className="tiket-page-title">Pemesanan Berhasil!</h1>
        <p className="tiket-page-subtitle">
          Berikut adalah e-tiket untuk setiap peserta. Tunjukkan QR Code kepada
          petugas di lokasi.
        </p>

        <div className="booking-info">
          <span>
            ID Booking: <strong>{bookingData.booking_id}</strong>
          </span>
          <span>
            Paket: <strong>{bookingData.package_name}</strong>
          </span>
        </div>

        {/* Tombol Download PDF Semua Tiket */}
        <div className="pdf-download-controls">
          <button
            className="download-all-pdf-btn"
            onClick={downloadAllTicketsPDF}
            disabled={isDownloading}
          >
            {isDownloading
              ? "⏳ Sedang membuat PDF..."
              : "📄 Download Semua Tiket (PDF)"}
          </button>
        </div>

        <div className="tiket-list">
          {bookingData.participants.map((participant) => (
            <div
              key={participant.participant_id}
              data-participant-id={participant.participant_id}
              style={{ "--ticket-index": participant.participant_id }}
              className="tiket-item-wrapper"
            >
              <Tiket
                participantId={participant.participant_id}
                bookingId={bookingData.booking_id}
                nama={participant.name}
                telepon={participant.phone}
                namaPaket={bookingData.package_name}
              />

              {/* Tombol Download PDF Individual */}
              <div className="individual-pdf-controls">
                <button
                  className="download-individual-pdf-btn"
                  onClick={() =>
                    downloadSingleTicketPDF(participant.participant_id)
                  }
                  disabled={isDownloading}
                >
                  📄 Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        <Link to="/" className="back-to-home-link">
          <span>Selesai & Kembali ke Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default TiketPage;
