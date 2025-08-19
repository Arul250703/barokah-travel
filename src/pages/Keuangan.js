import React, { useState, useMemo } from 'react';
import { 
    FaFileExport, 
    FaSearch, 
    FaMoneyBillWave,
    FaChartLine,
    FaFileInvoiceDollar,
    FaEye,
    FaEdit,
    FaTrash
} from 'react-icons/fa';
import styles from '../components/styles/Keuangan.module.css';

// ====== DATA DUMMY (contoh, bisa diubah sesuai kebutuhan) ======
const invoiceData = [
    {
        id: 1,
        namaPelanggan: 'BudI',
        email: 'budi@email.com',
        noTlp: '08123456789',
        tanggal: '2024-06-01',
        items: [{ deskripsi: 'Paket Umroh', harga: 20000000 }]
    },
    {
        id: 2,
        namaPelanggan: 'Siti Aminah',
        email: 'siti@email.com',
        tanggal: '2024-06-03',
        items: [{ deskripsi: 'Paket Haji', harga: 35000000 }]
    },
    {
        id: 3,
        namaPelanggan: 'Andi Wijaya',
        email: 'andi@email.com',
        noTlp: '083873645789',
        tanggal: '2024-06-05',
        items: [{ deskripsi: 'Paket Wisata Turki', harga: 15000000 }]
    }
];

const paymentStatusData = [
    { invoiceId: 1, status: 'Lunas' },
    { invoiceId: 2, status: 'DP' },
    { invoiceId: 3, status: 'Belum Lunas' }
];

// Komponen untuk Badge Status
const StatusBadge = ({ status }) => {
    const statusClass = {
        'Lunas': styles.lunas,
        'DP': styles.dp,
        'Belum Lunas': styles.belumBayar,
        'Pending': styles.pending,
        'Dibatalkan': styles.dibatalkan,
    };
    return (
        <span className={`${styles.status} ${statusClass[status] || styles.pending}`}>
            {status}
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

// Komponen Modal untuk Detail Invoice
const InvoiceDetailModal = ({ invoice, isOpen, onClose }) => {
    if (!isOpen || !invoice) return null;
    const total = invoice.items?.reduce((sum, item) => sum + item.harga, 0) || 0;
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Detail Invoice #{invoice.id}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.invoiceInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Nama Pelanggan:</span>
                            <span>{invoice.namaPelanggan}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Tanggal:</span>
                            <span>{new Date(invoice.tanggal || Date.now()).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Status:</span>
                            <StatusBadge status={invoice.status} />
                        </div>
                    </div>
                    <div className={styles.itemsList}>
                        <h3>Detail Items</h3>
                        <table className={styles.itemsTable}>
                            <thead>
                                <tr>
                                    <th>Deskripsi</th>
                                    <th>Harga</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.deskripsi}</td>
                                        <td>Rp {item.harga.toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.totalSection}>
                        <strong>Total: Rp {total.toLocaleString('id-ID')}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

function LaporanKeuanganPage() {
    // Gabungkan status pembayaran ke invoice
    const invoices = useMemo(() => {
        return invoiceData.map(inv => {
            const payment = paymentStatusData.find(p => p.invoiceId === inv.id);
            return {
                ...inv,
                status: payment?.status || 'Pending'
            };
        });
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [filterDate, setFilterDate] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sortBy, setSortBy] = useState('tanggal');
    const [sortOrder, setSortOrder] = useState('desc');

    const hitungTotal = (items) => {
        if (!items || items.length === 0) return 0;
        return items.reduce((sum, item) => sum + item.harga, 0);
    };

    // Filter dan search data
    const filteredInvoices = useMemo(() => {
        let filtered = invoices.filter(invoice => {
            const matchesSearch = invoice.namaPelanggan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.items?.[0]?.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'Semua' || invoice.status === filterStatus;
            const matchesDate = !filterDate || (invoice.tanggal &&
                new Date(invoice.tanggal).toISOString().split('T')[0] === filterDate);
            return matchesSearch && matchesStatus && matchesDate;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'nama':
                    aValue = a.namaPelanggan;
                    bValue = b.namaPelanggan;
                    break;
                case 'total':
                    aValue = hitungTotal(a.items);
                    bValue = hitungTotal(b.items);
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = new Date(a.tanggal || 0);
                    bValue = new Date(b.tanggal || 0);
            }
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [invoices, searchTerm, filterStatus, filterDate, sortBy, sortOrder]);

    // Hitung summary statistics
    const summaryStats = useMemo(() => {
        const total = invoices.reduce((sum, invoice) => sum + hitungTotal(invoice.items), 0);
        const lunas = invoices.filter(inv => inv.status === 'Lunas').length;
        const pending = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'DP').length;
        const totalLunas = invoices
            .filter(inv => inv.status === 'Lunas')
            .reduce((sum, invoice) => sum + hitungTotal(invoice.items), 0);

        return { total, lunas, pending, totalLunas };
    }, [invoices]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleViewDetail = (invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };

    const handleExport = () => {
        const csvContent = [
            ['Nama Pelanggan', 'Paket Tour', 'Total Tagihan', 'Status Pembayaran', 'Tanggal'],
            ...filteredInvoices.map(invoice => [
                invoice.namaPelanggan,
                invoice.items[0]?.deskripsi || 'N/A',
                hitungTotal(invoice.items),
                invoice.status,
                new Date(invoice.tanggal || Date.now()).toLocaleDateString('id-ID')
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'laporan_keuangan.csv';
        a.click();
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Laporan Keuangan</h1>
                    <p className={styles.subtitle}>Kelola dan monitor semua transaksi keuangan</p>
                </div>
                <button className={styles.exportButton} onClick={handleExport}>
                    <FaFileExport /> Export Data
                </button>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <SummaryCard
                    title="Total Pendapatan"
                    value={`Rp ${summaryStats.total.toLocaleString('id-ID')}`}
                    icon={FaMoneyBillWave}
                    color="green"
                    subtitle="Keseluruhan"
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
                    subtitle="Invoice pending"
                />
                <SummaryCard
                    title="Total Invoice"
                    value={invoices.length}
                    icon={FaFileInvoiceDollar}
                    color="purple"
                    subtitle="Semua transaksi"
                />
            </div>

            {/* Filters and Search */}
            <div className={styles.filtersSection}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Cari nama pelanggan atau paket tour..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filters}>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="Semua">Semua Status</option>
                        <option value="Lunas">Lunas</option>
                        <option value="DP">DP</option>
                        <option value="Belum Lunas">Belum Lunas</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className={styles.dateFilter}
                    />
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('nama')} className={styles.sortable}>
                                Nama Pelanggan
                                {sortBy === 'nama' && <span className={styles.sortIcon}>
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>}
                            </th>
                            <th>Paket Tour</th>
                            <th onClick={() => handleSort('total')} className={styles.sortable}>
                                Total Tagihan
                                {sortBy === 'total' && <span className={styles.sortIcon}>
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>}
                            </th>
                            <th onClick={() => handleSort('status')} className={styles.sortable}>
                                Status Pembayaran
                                {sortBy === 'status' && <span className={styles.sortIcon}>
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </span>}
                            </th>
                            <th onClick={() => handleSort('tanggal')} className={styles.sortable}>
                                Tanggal
                                {sortBy === 'tanggal' && (
                                    <span className={styles.sortIcon}>
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length > 0 ? (
                            filteredInvoices.map(invoice => (
                                <tr key={invoice.id}>
                                    <td>
                                        <div className={styles.customerInfo}>
                                            <strong>{invoice.namaPelanggan}</strong>
                                            <small>{invoice.email || 'No email'}</small>
                                            <small>{invoice.noTlp || 'No Tlp tidak tersedia'}</small>
                                        </div>
                                    </td>
                                    <td>{invoice.items[0]?.deskripsi || 'N/A'}</td>
                                    <td className={styles.amount}>
                                        Rp {hitungTotal(invoice.items).toLocaleString('id-ID')}
                                    </td>
                                    <td>
                                        <StatusBadge status={invoice.status} />
                                    </td>
                                    <td>
                                        {new Date(invoice.tanggal || Date.now()).toLocaleDateString('id-ID')}
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button 
                                                className={styles.viewButton}
                                                onClick={() => handleViewDetail(invoice)}
                                                title="Lihat Detail"
                                            >
                                                <FaEye />
                                            </button>
                                            <button 
                                                className={styles.editButton}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className={styles.deleteButton}
                                                title="Hapus"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className={styles.emptyMessage}>
                                    {searchTerm || filterStatus !== 'Semua' || filterDate 
                                        ? 'Tidak ada data yang sesuai dengan filter.'
                                        : 'Belum ada data pesanan untuk ditampilkan.'
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredInvoices.length > 0 && (
                <div className={styles.pagination}>
                    <span>Menampilkan {filteredInvoices.length} dari {invoices.length} data</span>
                </div>
            )}

            <InvoiceDetailModal
                invoice={selectedInvoice}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}

export default LaporanKeuanganPage;
