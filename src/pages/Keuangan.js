import React, { useState, useEffect, useMemo } from 'react';
import { 
    FaFileExport, FaSearch, FaMoneyBillWave, FaChartLine, 
    FaFileInvoiceDollar, FaEye, FaEdit, FaTrash, FaPlus, FaTimes, FaSave,
    FaUser, FaMapMarkerAlt, FaBirthdayCake
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
                            <div className={styles.infoItem}><label>Nama Pelanggan:</label><span>{invoice.namaPelanggan}</span></div>
                            <div className={styles.infoItem}><label>Email Kontak:</label><span>{invoice.email || 'N/A'}</span></div>
                        </div>
                    </div>
                    <div className={styles.tourSection}>
                        <h3>Informasi Booking</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}><label>Paket Tour:</label><span>{invoice.paketTour}</span></div>
                            <div className={styles.infoItem}><label>Total Tagihan:</label><span className={styles.totalAmount}>Rp {invoice.totalTagihan.toLocaleString('id-ID')}</span></div>
                            <div className={styles.infoItem}><label>Status:</label><StatusBadge status={invoice.status} /></div>
                            <div className={styles.infoItem}><label>Tanggal Booking:</label><span>{new Date(invoice.tanggal).toLocaleDateString('id-ID')}</span></div>
                            <div className={styles.infoItem}><label>Jumlah Peserta:</label><span>{invoice.items?.length || 0} orang</span></div>
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
                                            <div><strong>Nama:</strong> {p.name}</div>
                                            <div><strong>Telepon:</strong> {p.phone || '-'}</div>
                                            <div><strong>TTL:</strong> {p.birth_place || '-'}, {p.birth_date ? new Date(p.birth_date).toLocaleDateString('id-ID') : '-'}</div>
                                            <div><strong>Alamat:</strong> {p.address || '-'}</div>
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

    useEffect(() => {
        if (isOpen) {
            if (isEditing && invoice) {
                setFormData({
                    paketTour: invoice.paketTour || '',
                    email: invoice.email || '',
                    totalTagihan: invoice.totalTagihan || 0,
                    status: invoice.status || 'Pending',
                    // Data peserta tidak di-load di form edit sederhana ini
                    // Bisa ditambahkan jika perlu
                });
            } else {
                // Reset form untuk 'Tambah Baru'
                setFormData({
                    namaPaket: '',
                    emailKontak: '',
                    totalHarga: 0,
                    status: 'Pending',
                    peserta: [{ nama: '', telepon: '', alamat: '', tempatLahir: '', tanggalLahir: '' }]
                });
            }
        }
    }, [invoice, isEditing, isOpen]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
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
                        <input type="text" name={isEditing ? 'paketTour' : 'namaPaket'} value={isEditing ? formData.paketTour : formData.namaPaket} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email Kontak *</label>
                        <input type="email" name={isEditing ? 'email' : 'emailKontak'} value={isEditing ? formData.email : formData.emailKontak} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Total Harga *</label>
                        <input type="number" name={isEditing ? 'totalTagihan' : 'totalHarga'} value={isEditing ? formData.totalTagihan : formData.totalHarga} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="Pending">Pending</option>
                            <option value="DP">DP</option>
                            <option value="Lunas">Lunas</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                    </div>
                    {/* Logika untuk menambah/mengedit peserta bisa ditambahkan di sini jika perlu */}
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}><FaTimes /> Batal</button>
                        <button type="submit" className={styles.saveButton}><FaSave /> {isEditing ? 'Update' : 'Simpan'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function LaporanKeuanganPage() {
    const [laporanData, setLaporanData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
            const response = await fetch('http://localhost:5000/api/laporan-keuangan');
            const result = await response.json();
            if (result.success) {
                setLaporanData(result.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        return laporanData.filter(item => {
            const matchesSearch = (item.namaPelanggan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (item.paketTour || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [laporanData, searchTerm, filterStatus]);
    
    const summaryStats = useMemo(() => {
        const total = laporanData.reduce((sum, item) => sum + item.totalTagihan, 0);
        const lunas = laporanData.filter(item => item.status === 'Lunas').length;
        const totalLunas = laporanData.filter(item => item.status === 'Lunas').reduce((sum, item) => sum + item.totalTagihan, 0);
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
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchData(); // Ambil data terbaru
                handleCloseModal();
            } else {
                alert(`Gagal: ${result.message}`);
            }
        } catch (error) {
            alert("Tidak dapat terhubung ke server.");
        }
    };

    const handleDelete = async (invoiceId) => {
        if (!window.confirm(`Yakin ingin menghapus invoice #${invoiceId}?`)) return;
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${invoiceId}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchData(); // Ambil data terbaru
            } else {
                alert(`Gagal: ${result.message}`);
            }
        } catch (error) {
            alert("Tidak dapat terhubung ke server.");
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
                    <button className={styles.addButton} onClick={handleOpenAddModal}><FaPlus /> Tambah Booking</button>
                    <button className={styles.exportButton}><FaFileExport /> Export Data</button>
                </div>
            </div>

            <div className={styles.summaryGrid}>
                <SummaryCard title="Total Pendapatan" value={`Rp ${summaryStats.total.toLocaleString('id-ID')}`} icon={FaMoneyBillWave} color="green" />
                <SummaryCard title="Sudah Lunas" value={summaryStats.lunas} icon={FaChartLine} color="blue" subtitle={`Rp ${summaryStats.totalLunas.toLocaleString('id-ID')}`} />
                <SummaryCard title="Menunggu Pembayaran" value={summaryStats.pending} icon={FaFileInvoiceDollar} color="orange" />
                <SummaryCard title="Total Booking" value={laporanData.length} icon={FaFileInvoiceDollar} color="purple" />
            </div>

            <div className={styles.filtersSection}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input type="text" placeholder="Cari nama pelanggan atau paket tour..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className={styles.filters}>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="Semua">Semua Status</option>
                        <option value="Lunas">Lunas</option>
                        <option value="DP">DP</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
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
                        {isLoading ? (
                            <tr><td colSpan="7" className={styles.emptyMessage}>Memuat data...</td></tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map(item => {
                                const mainParticipant = item.items && item.items.length > 0 ? item.items[0] : {};
                                return (
                                <tr key={item.id}>
                                    <td><strong>{item.namaPelanggan}</strong><br/><small>{item.email}</small></td>
                                    <td>
                                        <div className={styles.personalInfo}>
                                            <div className={styles.birthInfo}><FaBirthdayCake className={styles.infoIcon} /><span>{mainParticipant.birth_place || 'N/A'}, {mainParticipant.birth_date ? new Date(mainParticipant.birth_date).toLocaleDateString('id-ID') : 'N/A'}</span></div>
                                            <div className={styles.addressInfo}><FaMapMarkerAlt className={styles.infoIcon} /><span>{mainParticipant.address || 'N/A'}</span></div>
                                        </div>
                                    </td>
                                    <td>{item.paketTour}</td>
                                    <td className={styles.amount}>Rp {item.totalTagihan.toLocaleString('id-ID')}</td>
                                    <td><StatusBadge status={item.status} /></td>
                                    <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button className={styles.viewButton} title="Lihat Detail" onClick={() => handleViewDetail(item)}><FaEye /></button>
                                            <button className={styles.editButton} title="Edit" onClick={() => handleOpenEditModal(item)}><FaEdit /></button>
                                            <button className={styles.deleteButton} title="Hapus" onClick={() => handleDelete(item.id)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="7" className={styles.emptyMessage}>Tidak ada data.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
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
