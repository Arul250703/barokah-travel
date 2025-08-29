import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BukuTamu = () => {
  const [currentView, setCurrentView] = useState('peserta');
  const [pesertaData, setPesertaData] = useState([]);
  const [marketingData, setMarketingData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    peserta: { today: 0, yesterday: 0, week: 0, month: 0, total: 0 },
    marketing: { today: 0, yesterday: 0, week: 0, month: 0, total: 0 }
  });

  // Ganti dengan URL API yang benar
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [currentView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentView === 'peserta') {
        const response = await axios.get(`${API_BASE}/api/admin/peserta`);
        setPesertaData(response.data);
      } else {
        const response = await axios.get(`${API_BASE}/api/admin/marketing`);
        setMarketingData(response.data);
      }     
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal mengambil data: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const pesertaResponse = await axios.get(`${API_BASE}/api/stats/peserta`);
      const marketingResponse = await axios.get(`${API_BASE}/api/stats/marketing`);
      
      setStats({
        peserta: pesertaResponse.data,
        marketing: marketingResponse.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        if (currentView === 'peserta') {
          await axios.delete(`${API_BASE}/api/admin/peserta/${id}`);
        } else {
          await axios.delete(`${API_BASE}/api/admin/marketing/${id}`);
        }
        alert('Data berhasil dihapus');
        fetchData();
        fetchStats();
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Gagal menghapus data: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditFormData(item);
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentView === 'peserta') {
        await axios.put(`${API_BASE}/api/admin/peserta/${editingItem.id}`, editFormData);
      } else {
        const formData = new FormData();
        for (const key in editFormData) {
          if (key !== 'foto_kunjungan' || editFormData[key] instanceof File) {
            formData.append(key, editFormData[key]);
          }
        }
        await axios.put(`${API_BASE}/api/admin/marketing/${editingItem.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      alert('Data berhasil diupdate');
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Gagal mengupdate data: ' + (error.response?.data?.error || error.message));
    }
  };

  const exportToCSV = () => {
    const data = currentView === 'peserta' ? pesertaData : marketingData;
    const headers = currentView === 'peserta' 
      ? ['ID', 'Tanggal', 'Nama', 'Alamat', 'Tempat Lahir', 'Tanggal Lahir', 'Telepon', 'Tujuan']
      : ['ID', 'Tanggal', 'Nama', 'Alamat', 'Perusahaan', 'Nama Koordinator', 'Kota Koordinator', 
         'Rencana Wisata', 'Rencana Pemberangkatan', 'Destinasi Tujuan', 'Jenis Trip', 'Telepon', 'Catatan'];
    
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
      const row = headers.map(header => {
        const fieldMap = {
          'ID': 'id',
          'Tanggal': 'tanggal',
          'Nama': 'nama',
          'Alamat': 'alamat',
          'Tempat Lahir': 'tempat_lahir',
          'Tanggal Lahir': 'tanggal_lahir',
          'Telepon': 'telepon',
          'Tujuan': 'tujuan',
          'Perusahaan': 'perusahaan',
          'Nama Koordinator': 'nama_kordinator',
          'Kota Koordinator': 'kota_kordinator',
          'Rencana Wisata': 'rencana_wisata',
          'Rencana Pemberangkatan': 'rencana_pemberangkatan',
          'Destinasi Tujuan': 'destinasi_tujuan',
          'Jenis Trip': 'jenis_trip',
          'Catatan': 'catatan'
        };
        
        const key = fieldMap[header];
        return `"${item[key] || ''}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentView}_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  const renderStatsCard = () => {
    const currentStats = currentView === 'peserta' ? stats.peserta : stats.marketing;
    
    return (
      <div className="stats-card">
        <h4>Statistik {currentView === 'peserta' ? 'Pengunjung' : 'Marketing'}</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{currentStats.today}</div>
            <div className="stat-label">Hari Ini</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{currentStats.yesterday}</div>
            <div className="stat-label">Kemarin</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{currentStats.week}</div>
            <div className="stat-label">Minggu Ini</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{currentStats.month}</div>
            <div className="stat-label">Bulan Ini</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{currentStats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return <div className="loading">Memuat data...</div>;
    }

    const data = currentView === 'peserta' ? pesertaData : marketingData;
    
    if (data.length === 0) {
      return <div className="no-data">Tidak ada data ditemukan</div>;
    }

    if (currentView === 'peserta') {
      return (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama</th>
                <th>Alamat</th>
                <th>Tempat Lahir</th>
                <th>Tanggal Lahir</th>
                <th>Telepon</th>
                <th>Tujuan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{formatDate(item.tanggal)}</td>
                  <td><strong>{item.nama}</strong></td>
                  <td>{item.alamat}</td>
                  <td>{item.tempat_lahir || '-'}</td>
                  <td>{formatDate(item.tanggal_lahir)}</td>
                  <td>{item.telepon}</td>
                  <td>{item.tujuan}</td>
                  <td>
                    <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama</th>
                <th>Alamat</th>
                <th>Perusahaan</th>
                <th>Koordinator</th>
                <th>Kota</th>
                <th>Rencana Wisata</th>
                <th>Pemberangkatan</th>
                <th>Destinasi</th>
                <th>Jenis Trip</th>
                <th>Telepon</th>
                <th>Foto</th>
                <th>Catatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{formatDate(item.tanggal)}</td>
                  <td><strong>{item.nama}</strong></td>
                  <td>{item.alamat}</td>
                  <td>{item.perusahaan || '-'}</td>
                  <td>{item.nama_kordinator}</td>
                  <td>{item.kota_kordinator}</td>
                  <td>{item.rencana_wisata || '-'}</td>
                  <td>{formatDate(item.rencana_pemberangkatan)}</td>
                  <td>{item.destinasi_tujuan}</td>
                  <td>{item.jenis_trip}</td>
                  <td>{item.telepon}</td>
                  <td>
                    {item.foto_kunjungan ? (
                      <img 
                        src={`${API_BASE}/uploads/${item.foto_kunjungan}`} 
                        alt="Foto Kunjungan" 
                        className="table-image"
                        onClick={() => window.open(`${API_BASE}/uploads/${item.foto_kunjungan}`, '_blank')}
                      />
                    ) : '-'}
                  </td>
                  <td className="catatan-cell">{item.catatan || '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  const renderEditForm = () => {
    if (!editingItem) return null;

    if (currentView === 'peserta') {
      return (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Data Peserta</h3>
            <form onSubmit={handleEditSubmit}>
              <input type="text" name="nama" value={editFormData.nama || ''} onChange={handleEditChange} placeholder="Nama" required />
              <input type="text" name="alamat" value={editFormData.alamat || ''} onChange={handleEditChange} placeholder="Alamat" required />
              <input type="text" name="tempat_lahir" value={editFormData.tempat_lahir || ''} onChange={handleEditChange} placeholder="Tempat Lahir" />
              <input type="date" name="tanggal_lahir" value={editFormData.tanggal_lahir?.split('T')[0] || ''} onChange={handleEditChange} />
              <input type="text" name="telepon" value={editFormData.telepon || ''} onChange={handleEditChange} placeholder="Telepon" required />
              <input type="text" name="tujuan" value={editFormData.tujuan || ''} onChange={handleEditChange} placeholder="Tujuan" required />
              <div className="modal-buttons">
                <button type="submit">Simpan</button>
                <button type="button" onClick={() => setEditingItem(null)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Data Marketing</h3>
            <form onSubmit={handleEditSubmit}>
              <input type="text" name="nama" value={editFormData.nama || ''} onChange={handleEditChange} placeholder="Nama" required />
              <input type="text" name="perusahaan" value={editFormData.perusahaan || ''} onChange={handleEditChange} placeholder="Perusahaan" />
              <input type="text" name="alamat" value={editFormData.alamat || ''} onChange={handleEditChange} placeholder="Alamat" required />
              <input type="text" name="nama_kordinator" value={editFormData.nama_kordinator || ''} onChange={handleEditChange} placeholder="Nama Koordinator" required />
              <input type="text" name="kota_kordinator" value={editFormData.kota_kordinator || ''} onChange={handleEditChange} placeholder="Kota Koordinator" required />
              <input type="text" name="rencana_wisata" value={editFormData.rencana_wisata || ''} onChange={handleEditChange} placeholder="Rencana Wisata" />
              <input type="date" name="rencana_pemberangkatan" value={editFormData.rencana_pemberangkatan?.split('T')[0] || ''} onChange={handleEditChange} required />
              <input type="text" name="destinasi_tujuan" value={editFormData.destinasi_tujuan || ''} onChange={handleEditChange} placeholder="Destinasi Tujuan" required />
              <select name="jenis_trip" value={editFormData.jenis_trip || ''} onChange={handleEditChange} required>
                <option value="">Pilih Jenis Trip</option>
                <option value="One Day">One Day</option>
                <option value="Overland">Overland</option>
              </select>
              <input type="text" name="telepon" value={editFormData.telepon || ''} onChange={handleEditChange} placeholder="Telepon" required />
              <textarea name="catatan" value={editFormData.catatan || ''} onChange={handleEditChange} placeholder="Catatan"></textarea>
              <div>
                <label>Foto Kunjungan (opsional):</label>
                <input type="file" name="foto_kunjungan" onChange={handleEditChange} />
                {editFormData.foto_kunjungan && typeof editFormData.foto_kunjungan === 'string' && (
                  <div className="current-image">
                    <img src={`${API_BASE}/uploads/${editFormData.foto_kunjungan}`} alt="Current" />
                    <p>Foto saat ini</p>
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit">Simpan</button>
                <button type="button" onClick={() => setEditingItem(null)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="admin-container">
      <style jsx>{`
        .admin-container {
          padding: 20px;
          max-width: 1600px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f4f6f9;
          min-height: 100vh;
        }
        
        .table-image {
          max-width: 60px;
          max-height: 60px;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s;
          object-fit: cover;
        }
        
        .table-image:hover {
          transform: scale(1.8);
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          z-index: 10;
          position: relative;
        }
        
        .current-image img {
          max-width: 150px;
          max-height: 150px;
          border-radius: 8px;
          margin-top: 10px;
          border: 1px solid #ddd;
        }
        
        .catatan-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .catatan-cell:hover {
          white-space: normal;
          overflow: visible;
          position: relative;
          z-index: 5;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .admin-header {
          background: #4e73df;
          color: white;
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 30px;
          text-align: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .admin-header h1 {
          margin: 0;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .admin-header p {
          margin: 8px 0 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }
        
        .admin-controls {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 15px;
          align-items: center;
          background: white;
          padding: 15px 20px;
          border-radius: 15px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        }
        
        .view-buttons {
          display: flex;
          gap: 10px;
        }
        
        .btn-view {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          background: #f1f3f5;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          color: #495057;
        }
        
        .btn-view.active {
          background: #4e73df;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(78,115,223,0.3);
        }
        
        .btn-view:hover {
          background: #e9ecef;
        }
        
        .btn-export, .btn-refresh {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          margin-left: 10px;
        }
        
        .btn-export {
          background: #1cc88a;
          color: white;
        }
        
        .btn-refresh {
          background: #36b9cc;
          color: white;
        }
        
        .btn-export:hover { background: #17a673; }
        .btn-refresh:hover { background: #2c9faf; }
        
        .stats-card {
          background: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        }
        
        .stats-card h4 {
          margin: 0 0 20px;
          color: #333;
          text-align: center;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
        }
        
        .stat-item {
          text-align: center;
          padding: 18px;
          background: #4e73df;
          color: white;
          border-radius: 12px;
          box-shadow: 0 3px 8px rgba(78,115,223,0.3);
        }
        
        .stat-number {
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 0.85rem;
          opacity: 0.9;
        }
        
        .table-container {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          overflow-x: auto;
        }
        
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }
        
        .admin-table th,
        .admin-table td {
          padding: 14px;
          text-align: center;
          border-bottom: 1px solid #f1f1f1;
          font-size: 14px;
        }
        
        .admin-table th {
          background: #4e73df;
          color: white;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 5;
        }
        
        .admin-table tr:nth-child(even) {
          background-color: #f8f9fc;
        }
        
        .admin-table tr:hover {
          background-color: #eef2ff;
        }
        
        .btn-edit {
          background: #f6c23e;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        
        .btn-delete {
          background: #e74a3b;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .btn-edit:hover { background: #dda20a; }
        .btn-delete:hover { background: #c0392b; }
        
        .loading, .no-data {
          text-align: center;
          padding: 50px;
          font-size: 16px;
          color: #555;
          background: white;
          border-radius: 15px;
          margin: 20px 0;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        }
        
        .loading { color: #4e73df; }

        .edit-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        .edit-modal-content {
          background: #fff;
          padding: 25px;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          animation: slideDown 0.3s ease;
        }

        .edit-modal-content h3 {
          margin-bottom: 15px;
          text-align: center;
        }

        .edit-modal-content input,
        .edit-modal-content select,
        .edit-modal-content textarea {
          width: 100%;
          padding: 10px 12px;
          margin-bottom: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
          transition: border 0.2s ease;
        }

        .edit-modal-content input:focus,
        .edit-modal-content select:focus,
        .edit-modal-content textarea:focus {
          border-color: #007bff;
          outline: none;
        }

        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 15px;
        }

        .modal-buttons button {
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .modal-buttons button[type="submit"] {
          background: #007bff;
          color: white;
        }

        .modal-buttons button[type="button"] {
          background: #ccc;
          color: #000;
        }

        .modal-buttons button:hover {
          opacity: 0.9;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .admin-controls {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }
          
          .view-buttons {
            width: 100%;
          }
          
          .btn-view {
            flex: 1;
            text-align: center;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .admin-table th, .admin-table td {
            padding: 10px;
            font-size: 12px;
          }

          .edit-modal-content {
            max-width: 95%;
            max-height: 85vh;
          }
        }
      `}</style>
      
      <div className="admin-header">
        <h1>Buku Tamu - Barokah Tour and Travel</h1>
        <p>Kelola data pengunjung dan marketing</p>
      </div>

      <div className="admin-controls">
        <div className="view-buttons">
          <button 
            className={`btn-view ${currentView === 'peserta' ? 'active' : ''}`}
            onClick={() => setCurrentView('peserta')}
          >
            Data Pengunjung ({stats.peserta.total})
          </button>
          <button 
            className={`btn-view ${currentView === 'marketing' ? 'active' : ''}`}
            onClick={() => setCurrentView('marketing')}
          >
            Data Marketing ({stats.marketing.total})
          </button>
        </div>
        
        <div>
          <button className="btn-refresh" onClick={() => { fetchData(); fetchStats(); }}>
            🔄 Refresh Data
          </button>
          <button className="btn-export" onClick={exportToCSV}>
            📊 Export CSV
          </button>
        </div>
      </div>

      {renderStatsCard()}

      {renderTable()}

      {renderEditForm()}
    </div>
  );
};

export default BukuTamu;