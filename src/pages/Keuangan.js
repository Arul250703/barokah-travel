import React, { useState, useEffect, useMemo } from 'react';
import { 
    FaFileExport, FaSearch, FaMoneyBillWave, FaChartLine, 
    FaFileInvoiceDollar, FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaSave,
    FaUser, FaMapMarkerAlt, FaBirthdayCake, FaExclamationTriangle
} from 'react-icons/fa';
import styles from '../components/styles/Keuangan.module.css';

// Komponen untuk Badge Status
const StatusBadge = ({ status }) => {
    const statusClass = {
        'Lunas': styles.lunas,
        'DP': styles.dp,
        'Pending': styles.pending,
        'Dibatalkan': styles.dibatalkan,
    };
    return <span className={`${styles.status} ${statusClass[status] || styles.pending}`}>{status}</span>;
};

// Komponen untuk Summary Cards
const SummaryCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`${styles.summaryCard} ${styles[color]}`}>
        <div className={styles.cardIcon}><Icon /></div>
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
const InvoiceDetailModal = ({ invoice, isOpen, onClose }) => {
    if (!isOpen || !invoice) return null;
    
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Detail Booking #{invoice.id}</h2>
                    <button className={styles.closeButton} onClick={onClose}><FaTimes /></button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.customerSection}>
                        <h3><FaUser /> Informasi Kontak</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Nama Pelanggan:</label>
                                <span>{invoice.namaPelanggan || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Email Kontak:</label>
                                <span>{invoice.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.tourSection}>
                        <h3>Informasi Booking</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Paket Tour:</label>
                                <span>{invoice.paketTour || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Total Tagihan:</label>
                                <span className={styles.totalAmount}>
                                    Rp {(invoice.totalTagihan || 0).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Status:</label>
                                <StatusBadge status={invoice.status} />
                            </div>
                            <div className={styles.infoItem}>
                                <label>Tanggal Booking:</label>
                                <span>
                                    {invoice.tanggal ? new Date(invoice.tanggal).toLocaleDateString('id-ID') : 'N/A'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Jumlah Peserta:</label>
                                <span>{invoice.items?.length || 0} orang</span>
                            </div>
                        </div>
                    </div>
                    {invoice.items && invoice.items.length > 0 && (
                        <div className={styles.participantsSection}>
                            <h3>Daftar Peserta</h3>
                            <div className={styles.participantsList}>
                                {invoice.items.map((p, index) => (
                                    <div key={p.id || index} className={styles.participantCard}>
                                        <h4>Peserta {index + 1}</h4>
                                        <div className={styles.participantInfo}>
                                            <div><strong>Nama:</strong> {p.name || 'N/A'}</div>
                                            <div><strong>Telepon:</strong> {p.phone || 'N/A'}</div>
                                            <div><strong>TTL:</strong> {p.birth_place || 'N/A'}, {p.birth_date ? new Date(p.birth_date).toLocaleDateString('id-ID') : 'N/A'}</div>
                                            <div><strong>Alamat:</strong> {p.address || 'N/A'}</div>
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
const FormModal = ({ invoice, isOpen, onClose, onSave, isEditing }) => {
    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isEditing && invoice) {
                setFormData({
                    paketTour: invoice.paketTour || '',
                    email: invoice.email || '',
                    totalTagihan: invoice.totalTagihan || 0,
                    status: invoice.status || 'Pending',
                });
            } else {
                // Reset form untuk 'Tambah Baru'
                setFormData({
                    namaPaket: '',
                    emailKontak: '',
                    totalHarga: 0,
                    status: 'Pending',
                    peserta: [{ 
                        nama: '', 
                        telepon: '', 
                        alamat: '', 
                        tempatLahir: '', 
                        tanggalLahir: '' 
                    }]
                });
            }
        }
    }, [invoice, isEditing, isOpen]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'totalTagihan' || name === 'totalHarga' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleParticipantChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            peserta: prev.peserta.map((p, i) => 
                i === index ? { ...p, [field]: value } : p
            )
        }));
    };

    const addParticipant = () => {
        setFormData(prev => ({
            ...prev,
            peserta: [...prev.peserta, { 
                nama: '', 
                telepon: '', 
                alamat: '', 
                tempatLahir: '', 
                tanggalLahir: '' 
            }]
        }));
    };

    const removeParticipant = (index) => {
        if (formData.peserta.length > 1) {
            setFormData(prev => ({
                ...prev,
                peserta: prev.peserta.filter((_, i) => i !== index)
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
            <div className={styles.formModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? `Edit Booking #${invoice.id}` : 'Tambah Booking Baru'}</h2>
                    <button className={styles.closeButton} onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>{isEditing ? 'Paket Tour' : 'Nama Paket'} *</label>
                        <input 
                            type="text" 
                            name={isEditing ? 'paketTour' : 'namaPaket'} 
                            value={isEditing ? formData.paketTour : formData.namaPaket} 
                            onChange={handleChange} 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email Kontak *</label>
                        <input 
                            type="email" 
                            name={isEditing ? 'email' : 'emailKontak'} 
                            value={isEditing ? formData.email : formData.emailKontak} 
                            onChange={handleChange} 
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Total Harga *</label>
                        <input 
                            type="number" 
                            name={isEditing ? 'totalTagihan' : 'totalHarga'} 
                            value={isEditing ? formData.totalTagihan : formData.totalHarga} 
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
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange}
                            disabled={isSubmitting}
                        >
                            <option value="Pending">Pending</option>
                            <option value="DP">DP</option>
                            <option value="Lunas">Lunas</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                    </div>

                    {/* Form peserta hanya untuk tambah baru */}
                    {!isEditing && (
                        <div className={styles.participantsSection}>
                            <div className={styles.sectionHeader}>
                                <h3>Daftar Peserta</h3>
                                <button type="button" onClick={addParticipant} className={styles.addParticipantButton} disabled={isSubmitting}>
                                    <FaPlus /> Tambah Peserta
                                </button>
                            </div>
                            {formData.peserta.map((peserta, index) => (
                                <div key={index} className={styles.participantForm}>
                                    <div className={styles.participantHeader}>
                                        <h4>Peserta {index + 1}</h4>
                                        {formData.peserta.length > 1 && (
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
                                                value={peserta.nama}
                                                onChange={(e) => handleParticipantChange(index, 'nama', e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Telepon</label>
                                            <input
                                                type="tel"
                                                value={peserta.telepon}
                                                onChange={(e) => handleParticipantChange(index, 'telepon', e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Alamat</label>
                                            <textarea
                                                value={peserta.alamat}
                                                onChange={(e) => handleParticipantChange(index, 'alamat', e.target.value)}
                                                rows="2"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Tempat Lahir</label>
                                            <input
                                                type="text"
                                                value={peserta.tempatLahir}
                                                onChange={(e) => handleParticipantChange(index, 'tempatLahir', e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Tanggal Lahir</label>
                                            <input
                                                type="date"
                                                value={peserta.tanggalLahir}
                                                onChange={(e) => handleParticipantChange(index, 'tanggalLahir', e.target.value)}
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
                            <FaSave /> {isSubmitting ? 'Menyimpan...' : (isEditing ? 'Update' : 'Simpan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function LaporanKeuanganPage() {
    const [laporanData, setLaporanData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            console.log('Fetching data from API...');
            const response = await fetch('http://localhost:5000/api/laporan-keuangan');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.success) {
                setLaporanData(result.data || []);
                console.log(`Loaded ${result.data?.length || 0} records`);
            } else {
                throw new Error(result.message || 'Failed to fetch data');
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.message || 'Gagal mengambil data dari server');
            setLaporanData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!Array.isArray(laporanData)) return [];
        
        return laporanData.filter(item => {
            const matchesSearch = (
                (item.namaPelanggan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.paketTour || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.email || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [laporanData, searchTerm, filterStatus]);
    
    const summaryStats = useMemo(() => {
        if (!Array.isArray(laporanData)) {
            return { total: 0, lunas: 0, pending: 0, totalLunas: 0 };
        }
        
        const total = laporanData.reduce((sum, item) => sum + (parseFloat(item.totalTagihan) || 0), 0);
        const lunasItems = laporanData.filter(item => item.status === 'Lunas');
        const lunas = lunasItems.length;
        const totalLunas = lunasItems.reduce((sum, item) => sum + (parseFloat(item.totalTagihan) || 0), 0);
        const pending = laporanData.filter(item => item.status === 'Pending' || item.status === 'DP').length;
        
        return { total, lunas, pending, totalLunas };
    }, [laporanData]);

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setCurrentInvoice(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (invoice) => {
        setIsEditing(true);
        setCurrentInvoice(invoice);
        setIsFormModalOpen(true);
    };
    
    const handleViewDetail = (invoice) => {
        setCurrentInvoice(invoice);
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setShowDetailModal(false);
        setCurrentInvoice(null);
    };

    const handleSave = async (formData) => {
        const url = isEditing 
            ? `http://localhost:5000/api/bookings/${currentInvoice.id}`
            : 'http://localhost:5000/api/bookings';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            console.log('Saving data:', formData);
            
            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const result = await response.json();
            console.log('Save response:', result);
            
            if (response.ok && result.success) {
                alert(result.message || 'Data berhasil disimpan');
                await fetchData(); // Refresh data
                handleCloseModal();
            } else {
                throw new Error(result.message || 'Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert(`Gagal menyimpan: ${error.message}`);
        }
    };

    const handleDelete = async (invoiceId) => {
        if (!window.confirm(`Yakin ingin menghapus booking #${invoiceId}?`)) return;
        
        try {
            console.log('Deleting booking:', invoiceId);
            
            const response = await fetch(`http://localhost:5000/api/bookings/${invoiceId}`, {
                method: 'DELETE',
            });
            
            const result = await response.json();
            console.log('Delete response:', result);
            
            if (response.ok && result.success) {
                alert(result.message || 'Data berhasil dihapus');
                await fetchData(); // Refresh data
            } else {
                throw new Error(result.message || 'Gagal menghapus data');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(`Gagal menghapus: ${error.message}`);
        }
    };

    const handleExport = () => {
        if (laporanData.length === 0) {
            alert('Tidak ada data untuk diekspor');
            return;
        }

        try {
            // Convert data to CSV
            const headers = [
                'ID', 'Nama Pelanggan', 'Email', 'Paket Tour', 
                'Total Tagihan', 'Status', 'Tanggal', 'Jumlah Peserta'
            ];
            
            const csvContent = [
                headers.join(','),
                ...filteredData.map(item => [
                    item.id,
                    `"${item.namaPelanggan || 'N/A'}"`,
                    `"${item.email || 'N/A'}"`,
                    `"${item.paketTour || 'N/A'}"`,
                    item.totalTagihan || 0,
                    item.status || 'Pending',
                    item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : 'N/A',
                    item.items?.length || 0
                ].join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `laporan-keuangan-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Data berhasil diekspor');
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal mengekspor data');
        }
    };

    const handleRetry = () => {
        fetchData();
    };

    // Helper function untuk format tanggal yang aman
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('id-ID');
        } catch (error) {
            return 'N/A';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Keuangan / Invoice</h1>
                    <p className={styles.subtitle}>Kelola dan monitor semua transaksi keuangan</p>
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
                        disabled={isLoading || laporanData.length === 0}
                    >
                        <FaFileExport /> Export Data
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <SummaryCard 
                    title="Total Pendapatan" 
                    value={`Rp ${summaryStats.total.toLocaleString('id-ID')}`} 
                    icon={FaMoneyBillWave} 
                    color="green" 
                />
                <SummaryCard 
                    title="Sudah Lunas" 
                    value={summaryStats.lunas} 
                    icon={FaChartLine} 
                    color="blue" 
                    subtitle={`Rp ${summaryStats.totalLunas.toLocaleString('id-ID')}`} 
                />
                <SummaryCard 
                    title="Menunggu Pembayaran" 
                    value={summaryStats.pending} 
                    icon={FaFileInvoiceDollar} 
                    color="orange" 
                />
                <SummaryCard 
                    title="Total Booking" 
                    value={laporanData.length} 
                    icon={FaFileInvoiceDollar} 
                    color="purple" 
                />
            </div>

            {/* Filters */}
            <div className={styles.filtersSection}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input 
                        type="text" 
                        placeholder="Cari nama pelanggan, paket tour, atau email..." 
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
                        <option value="Lunas">Lunas</option>
                        <option value="DP">DP</option>
                        <option value="Pending">Pending</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className={styles.tableContainer}>
                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <ErrorMessage message={error} onRetry={handleRetry} />
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Pelanggan</th>
                                <th>TTL & Alamat</th>
                                <th>Paket Tour</th>
                                <th>Total Tagihan</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map(item => {
                                    const mainParticipant = (item.items && item.items.length > 0) ? item.items[0] : {};
                                    return (
                                        <tr key={item.id}>
                                            <td>#{item.id}</td>
                                            <td>
                                                <strong>{item.namaPelanggan || 'N/A'}</strong>
                                                <br/>
                                                <small>{item.email || 'N/A'}</small>
                                            </td>
                                            <td>
                                                <div className={styles.personalInfo}>
                                                    <div className={styles.birthInfo}>
                                                        <FaBirthdayCake className={styles.infoIcon} />
                                                        <span>
                                                            {mainParticipant.birth_place || 'N/A'}, {formatDate(mainParticipant.birth_date)}
                                                        </span>
                                                    </div>
                                                    <div className={styles.addressInfo}>
                                                        <FaMapMarkerAlt className={styles.infoIcon} />
                                                        <span>{mainParticipant.address || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.paketTour || 'N/A'}</td>
                                            <td className={styles.amount}>
                                                Rp {(parseFloat(item.totalTagihan) || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td><StatusBadge status={item.status} /></td>
                                            <td>{formatDate(item.tanggal)}</td>
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
                                    <td colSpan="8" className={styles.emptyMessage}>
                                        {searchTerm || filterStatus !== 'Semua' 
                                            ? 'Tidak ada data yang sesuai dengan filter.' 
                                            : 'Belum ada data booking.'}
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
                    <p>Menampilkan {filteredData.length} dari {laporanData.length} data</p>
                    {(searchTerm || filterStatus !== 'Semua') && (
                        <button 
                            className={styles.clearFilterButton}
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('Semua');
                            }}
                        >
                            <FaTimes /> Hapus Filter
                        </button>
                    )}
                </div>
            )}

            {/* Modals */}
            <InvoiceDetailModal 
                isOpen={showDetailModal}
                onClose={handleCloseModal}
                invoice={currentInvoice}
            />
            <FormModal 
                isOpen={isFormModalOpen}
                onClose={handleCloseModal}
                invoice={currentInvoice}
                onSave={handleSave}
                isEditing={isEditing}
            />
        </div>
    );
}

export default LaporanKeuanganPage;