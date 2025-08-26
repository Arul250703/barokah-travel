import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import styles from '../components/styles/Keuangan.module.css'; // Menggunakan style yang sama

// Komponen Modal untuk Form Tambah/Edit Pengguna
const UserFormModal = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ username: '', password: '', full_name: '', email: '' });
    const isEditing = !!user;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setFormData({ 
                    username: user.username, 
                    password: '', // Selalu kosongkan password saat edit
                    full_name: user.full_name || '',
                    email: user.email || ''
                });
            } else {
                setFormData({ username: '', password: '', full_name: '', email: '' });
            }
        }
    }, [user, isEditing, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.formModal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? `Edit Pengguna: ${user.username}` : 'Tambah Pengguna Baru'}</h2>
                    <button className={styles.closeButton} onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {/* === INPUT BARU DITAMBAHKAN DI SINI === */}
                    <div className={styles.formGroup}>
                        <label>Nama Lengkap *</label>
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    {/* ======================================= */}
                    <div className={styles.formGroup}>
                        <label>Username *</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Password {isEditing ? '(Isi jika ingin mengubah)' : '*'}</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing} />
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}><FaTimes /> Batal</button>
                        <button type="submit" className={styles.saveButton}><FaSave /> Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/users');
            const result = await response.json();
            if (result.success) setUsers(result.data);
        } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSaveUser = async (formData) => {
        const isEditing = !!currentUser;
        const url = isEditing ? `http://localhost:5000/api/users/${currentUser.id}` : 'http://localhost:5000/api/users';
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
                fetchUsers();
                handleCloseModal();
            } else {
                alert(`Gagal: ${result.message}`);
            }
        } catch (error) {
            alert("Tidak dapat terhubung ke server.");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Yakin ingin menghapus pengguna ini?`)) return;
        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                fetchUsers();
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
                    <h1 className={styles.title}>Kelola Admin</h1>
                    <p className={styles.subtitle}>Yang Bisa Login Hanya Admin Yang Terdaftar Disini</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.addButton} onClick={handleOpenAddModal}><FaPlus /> Tambah Pengguna</button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Tanggal Dibuat</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="6" className={styles.emptyMessage}>Memuat data...</td></tr>
                        ) : users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td><strong>{user.full_name}</strong></td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button className={styles.editButton} title="Edit" onClick={() => handleOpenEditModal(user)}><FaEdit /></button>
                                            <button className={styles.deleteButton} title="Hapus" onClick={() => handleDeleteUser(user.id)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className={styles.emptyMessage}>Tidak ada data pengguna.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <UserFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={currentUser}
                onSave={handleSaveUser}
            />
        </div>
    );
}

export default UsersPage;
