import React, { useState, useEffect, useMemo } from "react";
import {
  FaFileExport,
  FaSearch,
  FaMoneyBillWave,
  FaChartLine,
  FaFileInvoiceDollar,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSave,
  FaUser,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaExclamationTriangle,
} from "react-icons/fa";
import styles from "../components/styles/Keuangan.module.css";

// Komponen untuk Badge Status
const StatusBadge = ({ status }) => {
  const statusClass = {
    selesai: styles.lunas,
    menunggu_pembayaran: styles.pending,
    dibatalkan: styles.dibatalkan,
    gagal: styles.error,
  };
  return (
    <span
      className={`${styles.status} ${statusClass[status] || styles.pending}`}
    >
      {status === "selesai"
        ? "Lunas"
        : status === "menunggu_pembayaran"
        ? "Pending"
        : status.replace("_", " ")}
    </span>
  );
};

// Komponen untuk Summary Cards
const SummaryCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className={`${styles.summaryCard} ${styles[color]}`}>
    <div className={styles.cardIcon}>
      <Icon />
    </div>
    <div className={styles.cardContent}>
      <h3>{title}</h3>
      <div className={styles.cardValue}>{value}</div>
      {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
    </div>
  </div>
);

// Komponen Loading
const LoadingSpinner = () => (
  <div className={styles.loadingSpinner}>
    <div className={styles.spinner}></div>
    <p>Memuat data...</p>
  </div>
);

// Komponen Error Message
const ErrorMessage = ({ message, onRetry }) => (
  <div className={styles.errorMessage}>
    <FaExclamationTriangle />
    <p>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className={styles.retryButton}>
        Coba Lagi
      </button>
    )}
  </div>
);

// Komponen Modal untuk Detail Invoice
const InvoiceDetailModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Detail Booking #{booking.booking_id}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.customerSection}>
            <h3>
              <FaUser /> Informasi Kontak
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Nama Pelanggan:</label>
                <span>{booking.customer_name || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Email Kontak:</label>
                <span>{booking.customer_email || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className={styles.tourSection}>
            <h3>Informasi Booking</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Paket Tour:</label>
                <span>{booking.package_name || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Total Tagihan:</label>
                <span className={styles.totalAmount}>
                  Rp {(booking.total_price || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className={styles.infoItem}>
                <label>Status Pembayaran:</label>
                <StatusBadge status={booking.payment_status} />
              </div>
              <div className={styles.infoItem}>
                <label>Tanggal Booking:</label>
                <span>
                  {booking.booking_date
                    ? new Date(booking.booking_date).toLocaleDateString("id-ID")
                    : "N/A"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <label>Jumlah Peserta:</label>
                <span>{booking.participants?.length || 0} orang</span>
              </div>
            </div>
          </div>
          {booking.participants && booking.participants.length > 0 && (
            <div className={styles.participantsSection}>
              <h3>Daftar Peserta ({booking.participants.length})</h3>
              <div className={styles.participantsList}>
                {booking.participants.map((p, index) => (
                  <div
                    key={p.participant_id || index}
                    className={styles.participantCard}
                  >
                    <h4>Peserta {index + 1}</h4>
                    <div className={styles.participantInfo}>
                      <div>
                        <strong>Nama:</strong> {p.name || "N/A"}
                      </div>
                      <div>
                        <strong>Telepon:</strong> {p.phone || "N/A"}
                      </div>
                      <div>
                        <strong>Status Tiket:</strong>{" "}
                        <StatusBadge status={p.ticket_status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponen Modal untuk Form Edit/Add
const FormModal = ({ booking, isOpen, onClose, onSave, isEditing }) => {
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && booking) {
        setFormData({
          package_name: booking.package_name || "",
          customer_email: booking.customer_email || "",
          total_price: booking.total_price || 0,
          payment_status: booking.payment_status || "menunggu_pembayaran",
        });
      } else {
        // Reset form untuk 'Tambah Baru'
        setFormData({
          package_id: "",
          customer_name: "",
          customer_email: "",
          total_price: 0,
          participants: [
            {
              name: "",
              phone: "",
              address: "",
              birth_place: "",
              birth_date: "",
            },
          ],
        });
      }
    }
  }, [booking, isEditing, isOpen]);

  if (!isOpen || !formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleParticipantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addParticipant = () => {
    setFormData((prev) => ({
      ...prev,
      participants: [
        ...prev.participants,
        {
          name: "",
          phone: "",
          address: "",
          birth_place: "",
          birth_date: "",
        },
      ],
    }));
  };

  const removeParticipant = (index) => {
    if (formData.participants.length > 1) {
      setFormData((prev) => ({
        ...prev,
        participants: prev.participants.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {isEditing
              ? `Edit Booking #${booking.booking_id}`
              : "Tambah Booking Baru"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {!isEditing && (
            <div className={styles.formGroup}>
              <label>Package ID *</label>
              <input
                type="number"
                name="package_id"
                value={formData.package_id}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="ID Paket (misal: 1, 2, 3)"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>{isEditing ? "Paket Tour" : "Nama Customer"} *</label>
            <input
              type="text"
              name={isEditing ? "package_name" : "customer_name"}
              value={isEditing ? formData.package_name : formData.customer_name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email Customer *</label>
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Total Harga *</label>
            <input
              type="number"
              name="total_price"
              value={formData.total_price}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              name={isEditing ? "payment_status" : "status"}
              value={
                isEditing ? formData.payment_status : "menunggu_pembayaran"
              }
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="menunggu_pembayaran">Pending</option>
              <option value="selesai">Lunas</option>
              <option value="dibatalkan">Dibatalkan</option>
              <option value="gagal">Gagal</option>
            </select>
          </div>

          {/* Form peserta hanya untuk tambah baru */}
          {!isEditing && (
            <div className={styles.participantsSection}>
              <div className={styles.sectionHeader}>
                <h3>Daftar Peserta</h3>
                <button
                  type="button"
                  onClick={addParticipant}
                  className={styles.addParticipantButton}
                  disabled={isSubmitting}
                >
                  <FaPlus /> Tambah Peserta
                </button>
              </div>
              {formData.participants.map((peserta, index) => (
                <div key={index} className={styles.participantForm}>
                  <div className={styles.participantHeader}>
                    <h4>Peserta {index + 1}</h4>
                    {formData.participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className={styles.removeParticipantButton}
                        disabled={isSubmitting}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  <div className={styles.participantFields}>
                    <div className={styles.formGroup}>
                      <label>Nama Lengkap *</label>
                      <input
                        type="text"
                        value={peserta.name}
                        onChange={(e) =>
                          handleParticipantChange(index, "name", e.target.value)
                        }
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Telepon</label>
                      <input
                        type="tel"
                        value={peserta.phone}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "phone",
                            e.target.value
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Alamat</label>
                      <textarea
                        value={peserta.address}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "address",
                            e.target.value
                          )
                        }
                        rows="2"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tempat Lahir</label>
                      <input
                        type="text"
                        value={peserta.birth_place}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "birth_place",
                            e.target.value
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tanggal Lahir</label>
                      <input
                        type="date"
                        value={peserta.birth_date}
                        onChange={(e) =>
                          handleParticipantChange(
                            index,
                            "birth_date",
                            e.target.value
                          )
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              <FaTimes /> Batal
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              <FaSave />{" "}
              {isSubmitting ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Keuangan() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  // --- FUNGSI PENGAMBILAN DATA YANG DIPERBAIKI ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching data from API...");
      const response = await fetch("http://localhost:5000/api/bookings");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success && Array.isArray(result.data)) {
        setBookings(result.data);
        console.log(`Loaded ${result.data.length} records`);
      } else {
        console.error("Format data dari API tidak sesuai:", result);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Gagal mengambil data dari server");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    return bookings.filter((item) => {
      const matchesSearch =
        (item.customer_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.package_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.customer_email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.booking_id || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "Semua" || item.payment_status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, filterStatus]);

  const summaryStats = useMemo(() => {
    if (!Array.isArray(bookings)) {
      return { total: 0, lunas: 0, pending: 0, totalLunas: 0 };
    }
    const total = bookings.reduce(
      (sum, item) => sum + (parseFloat(item.total_price) || 0),
      0
    );
    const lunasItems = bookings.filter(
      (item) => item.payment_status === "selesai"
    );
    const lunas = lunasItems.length;
    const totalLunas = lunasItems.reduce(
      (sum, item) => sum + (parseFloat(item.total_price) || 0),
      0
    );
    const pending = bookings.filter(
      (item) => item.payment_status === "menunggu_pembayaran"
    ).length;

    return { total, lunas, pending, totalLunas };
  }, [bookings]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentBooking(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (booking) => {
    setIsEditing(true);
    setCurrentBooking(booking);
    setIsFormModalOpen(true);
  };

  const handleViewDetail = (booking) => {
    setCurrentBooking(booking);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setShowDetailModal(false);
    setCurrentBooking(null);
  };

  const handleSave = async (formData) => {
    const url = isEditing
      ? `http://localhost:5000/api/bookings/${currentBooking.id}`
      : "http://localhost:5000/api/bookings";
    const method = isEditing ? "PUT" : "POST";

    try {
      console.log("Saving data:", formData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Save response:", result);

      if (response.ok && result.success) {
        alert(result.message || "Data berhasil disimpan");
        await fetchData(); // Refresh data
        handleCloseModal();
      } else {
        throw new Error(result.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert(`Gagal menyimpan: ${error.message}`);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm(`Yakin ingin menghapus booking #${bookingId}?`)) return;

    try {
      console.log("Deleting booking:", bookingId);

      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      console.log("Delete response:", result);

      if (response.ok && result.success) {
        alert(result.message || "Data berhasil dihapus");
        await fetchData(); // Refresh data
      } else {
        throw new Error(result.message || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  const handleExport = () => {
    if (bookings.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    try {
      // Convert data to CSV
      const headers = [
        "ID Booking",
        "Nama Customer",
        "Email",
        "Paket Tour",
        "Total Harga",
        "Status Pembayaran",
        "Tanggal Booking",
        "Jumlah Peserta",
      ];

      const csvContent = [
        headers.join(","),
        ...filteredData.map((item) =>
          [
            `"${item.booking_id || "N/A"}"`,
            `"${item.customer_name || "N/A"}"`,
            `"${item.customer_email || "N/A"}"`,
            `"${item.package_name || "N/A"}"`,
            item.total_price || 0,
            item.payment_status || "menunggu_pembayaran",
            item.booking_date
              ? new Date(item.booking_date).toLocaleDateString("id-ID")
              : "N/A",
            item.participants?.length || 0,
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `keuangan-data-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Data berhasil diekspor");
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal mengekspor data");
    }
  };

  // Helper function untuk format tanggal yang aman
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("id-ID");
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Keuangan / Invoice</h1>
          <p className={styles.subtitle}>
            Kelola dan monitor semua transaksi keuangan
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={handleOpenAddModal}
            disabled={isLoading}
          >
            <FaPlus /> Tambah Booking
          </button>
          <button
            className={styles.exportButton}
            onClick={handleExport}
            disabled={isLoading || bookings.length === 0}
          >
            <FaFileExport /> Export Data
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <SummaryCard
          title="Total Pendapatan"
          value={`Rp ${summaryStats.total.toLocaleString("id-ID")}`}
          icon={FaMoneyBillWave}
          color="green"
        />
        <SummaryCard
          title="Sudah Lunas"
          value={summaryStats.lunas}
          icon={FaChartLine}
          color="blue"
          subtitle={`Rp ${summaryStats.totalLunas.toLocaleString("id-ID")}`}
        />
        <SummaryCard
          title="Menunggu Pembayaran"
          value={summaryStats.pending}
          icon={FaFileInvoiceDollar}
          color="orange"
        />
        <SummaryCard
          title="Total Booking"
          value={bookings.length}
          icon={FaFileInvoiceDollar}
          color="purple"
        />
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama, paket, email, atau ID booking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            disabled={isLoading}
          >
            <option value="Semua">Semua Status</option>
            <option value="selesai">Lunas</option>
            <option value="menunggu_pembayaran">Pending</option>
            <option value="dibatalkan">Dibatalkan</option>
            <option value="gagal">Gagal</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchData} />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Booking</th>
                <th>Pelanggan</th>
                <th>Paket Tour</th>
                <th>Total Tagihan</th>
                <th>Status Pembayaran</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const mainParticipant =
                    item.participants && item.participants.length > 0
                      ? item.participants[0]
                      : {};
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.booking_id || "N/A"}</strong>
                      </td>
                      <td>
                        <strong>{item.customer_name || "N/A"}</strong>
                        <br />
                        <small>{item.customer_email || "N/A"}</small>
                        {mainParticipant.name && (
                          <div className={styles.personalInfo}>
                            <div className={styles.birthInfo}>
                              <FaBirthdayCake className={styles.infoIcon} />
                              <span>Peserta utama: {mainParticipant.name}</span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td>{item.package_name || "N/A"}</td>
                      <td className={styles.amount}>
                        Rp{" "}
                        {(parseFloat(item.total_price) || 0).toLocaleString(
                          "id-ID"
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.payment_status} />
                      </td>
                      <td>{formatDate(item.booking_date)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.viewButton}
                            title="Lihat Detail"
                            onClick={() => handleViewDetail(item)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className={styles.editButton}
                            title="Edit"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={styles.deleteButton}
                            title="Hapus"
                            onClick={() => handleDelete(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className={styles.emptyMessage}>
                    {searchTerm || filterStatus !== "Semua"
                      ? "Tidak ada data yang sesuai dengan filter."
                      : "Belum ada data booking."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Info tambahan */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className={styles.tableInfo}>
          <p>
            Menampilkan {filteredData.length} dari {bookings.length} data
          </p>
          {(searchTerm || filterStatus !== "Semua") && (
            <button
              className={styles.clearFilterButton}
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("Semua");
              }}
            >
              <FaTimes /> Hapus Filter
            </button>
          )}
        </div>
      )}

      <InvoiceDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        booking={currentBooking}
      />

      <FormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        booking={currentBooking}
        onSave={handleSave}
        isEditing={isEditing}
      />
    </div>
  );
}

export default Keuangan;
