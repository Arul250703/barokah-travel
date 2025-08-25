import React, { useState, useEffect } from 'react';
import Logo from '../assets/images/Logo.webp';
// import Rekapitulasi from './rekapitulasi';


const BukuTamu = () => {
  const [currentView, setCurrentView] = useState('peserta'); // 'peserta' or 'marketing'
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({
    today: 15,
    yesterday: 12,
    week: 87,
    month: 342,
    total: 2543
  });
  const [marketingStats, setMarketingStats] = useState({
    today: 5,
    yesterday: 3,
    week: 18,
    month: 67,
    total: 432
  });

  // Mock data untuk demo
  const [pesertaData, setPesertaData] = useState([]);
  const [marketingData, setMarketingData] = useState([]);

  // Generate mock data
  useEffect(() => {
    const generateMockPesertaData = () => {
      const data = [];
      const today = new Date();
      
      for (let i = 1; i <= 50; i++) {
        const date = new Date();
        date.setDate(today.getDate() - Math.floor(Math.random() * 30));
        
        data.push({
          id: i,
          tanggal: `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`,
          nama: `Pengunjung ${i}`,
          alamat: `Alamat ${i}, Kota ${i}`,
          tempat_lahir: `Kota ${i}`,
          tanggal_lahir: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${Math.floor(Math.random() * 30) + 1980}`,
          telepon: `08${Math.floor(100000000 + Math.random() * 900000000)}`,
          tujuan: `Tujuan kunjungan ${i}`
        });
      }
      return data;
    };

    const generateMockMarketingData = () => {
      const data = [];
      const today = new Date();
      const tripTypes = ['One Day', 'Overland'];
      
      for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - Math.floor(Math.random() * 30));
        const departureDate = new Date();
        departureDate.setDate(today.getDate() + Math.floor(Math.random() * 60));
        
        data.push({
          id: i,
          tanggal: `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`,
          nama: `Marketing ${i}`,
          perusahaan: `Perusahaan ${i}`,
          alamat: `Alamat perusahaan ${i}`,
          nama_kordinator: `Koordinator ${i}`,
          kota_kordinator: `Kota ${i}`,
          rencana_wisata: `Paket wisata ${i}`,
          rencana_pemberangkatan: `${String(departureDate.getDate()).padStart(2, '0')}-${String(departureDate.getMonth() + 1).padStart(2, '0')}-${departureDate.getFullYear()}`,
          destinasi_tujuan: `Destinasi ${i}`,
          jenis_trip: tripTypes[Math.floor(Math.random() * tripTypes.length)],
          telepon: `08${Math.floor(100000000 + Math.random() * 900000000)}`,
          foto_kunjungan: i % 3 === 0 ? `marketing${i}.jpg` : null,
          catatan: i % 2 === 0 ? `Catatan untuk marketing ${i}` : null
        });
      }
      return data;
    };

    setPesertaData(generateMockPesertaData());
    setMarketingData(generateMockMarketingData());
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formType = currentView;
    
    // Simulasi penyimpanan data
    alert(`Data ${formType} berhasil disimpan!`);
    setFormData({});
    e.target.reset();
  };

  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const renderPagination = (data, onPageChange) => {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    if (totalPages <= 1) return null;

    return (
      <nav>
        <ul className="pagination justify-content-center">
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(i + 1);
                  onPageChange(i + 1);
                }}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  const renderTable = () => {
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    if (currentView === 'peserta') {
      const paginatedData = pesertaData.slice(startIndex, endIndex);
      
      return (
        <div className="data-table-container">
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th style={{width: '60px'}}>No</th>
                  <th style={{width: '120px'}}>Tanggal</th>
                  <th>Nama Pengunjung</th>
                  <th>Alamat</th>
                  <th>Tempat Tanggal Lahir</th>
                  <th>Tujuan</th>
                  <th style={{width: '140px'}}>No. HP</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id}>
                    <td><strong>{startIndex + index + 1}</strong></td>
                    <td>{item.tanggal}</td>
                    <td><strong>{item.nama}</strong></td>
                    <td>{item.alamat}</td>
                    <td>{item.tempat_lahir}, {item.tanggal_lahir}</td>
                    <td>{item.tujuan}</td>
                    <td>{item.telepon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(pesertaData, setCurrentPage)}
        </div>
      );
    } else {
      const paginatedData = marketingData.slice(startIndex, endIndex);
      
      return (
        <div className="data-table-container">
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Nama Marketing</th>
                  <th>Instansi</th>
                  <th>Alamat Instansi</th>
                  <th>Nama Koordinator</th>
                  <th>Kota Koordinator</th>
                  <th>Rencana Wisata</th>
                  <th>Rencana Pemberangkatan</th>
                  <th>Destinasi Tujuan</th>
                  <th>Jenis Trip</th>
                  <th>No. HP</th>
                  <th>Foto Kunjungan</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id}>
                    <td><strong>{startIndex + index + 1}</strong></td>
                    <td>{item.tanggal}</td>
                    <td><strong>{item.nama}</strong></td>
                    <td>{item.perusahaan}</td>
                    <td>{item.alamat}</td>
                    <td>{item.nama_kordinator}</td>
                    <td>{item.kota_kordinator}</td>
                    <td>{item.rencana_wisata}</td>
                    <td>{item.rencana_pemberangkatan}</td>
                    <td>{item.destinasi_tujuan}</td>
                    <td>{item.jenis_trip}</td>
                    <td>{item.telepon}</td>
                    <td>{item.foto_kunjungan ? <img src={`uploads/${item.foto_kunjungan}`} style={{width:'80px'}} alt="Foto" /> : '-'}</td>
                    <td>{item.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(marketingData, setCurrentPage)}
        </div>
      );
    }
  };

  const switchView = (view) => {
    setCurrentView(view);
    setCurrentPage(1);
    setFormData({});
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style jsx>{`
        .main-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .header-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .logo {
          width: 250px;
          height: 120px;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          margin-bottom: 20px;
        }
        
        .header-title {
          color: white;
          font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
          font-size: 2.5rem;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          margin: 0;
          line-height: 1.2;
        }
        
        .modern-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: none;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .modern-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .card-header-modern {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 30px;
          border-bottom: none;
          font-weight: 600;
          font-size: 1.2rem;
        }
        
        .card-body-modern {
          padding: 30px;
        }
        
        .form-control-modern {
          border: 2px solid #e3f2fd;
          border-radius: 15px;
          padding: 20px 20px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          margin-bottom: 20px;
          width: 100%;
          box-sizing: border-box;
        }
        
        .form-control-modern:focus {
          border-color: #4facfe;
          box-shadow: 0 0 0 0.2rem rgba(79, 172, 254, 0.25);
          transform: translateY(-2px);
          outline: none;
        }
        
        .btn-modern {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 15px;
          padding: 15px 30px;
          font-weight: 600;
          font-size: 16px;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
        
        .btn-modern:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          color: white;
        }
        
        .btn-primary-modern {
          background: linear-gradient(135deg, #4facfe 0%, #764ba2 100%);
        }
        
        .btn-danger-modern {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        }
        
        .stats-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .stats-table {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          overflow: hidden;
          width: 100%;
        }
        
        .stats-table td {
          padding: 15px 20px;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: 500;
        }
        
        .stats-table tr:last-child td {
          border-bottom: none;
        }
        
        .data-table-container {
          background: white;
          border-radius: 7px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .table-modern {
          margin-bottom: 0;
          width: 100%;
        }
        
        .table-modern thead th {
          background: linear-gradient(135deg, #764ba2 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 20px 15px;
          font-weight: 600;
          text-align: center;
        }
        
        .table-modern tbody tr {
          transition: background-color 0.3s ease;
        }
        
        .table-modern tbody tr:hover {
          background-color: rgba(79, 172, 254, 0.1);
        }
        
        .table-modern td {
          padding: 15px;
          vertical-align: middle;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          text-align: center;
        }
        
        .action-buttons {
          margin-bottom: 25px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .footer-text {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 14px;
        }
        
        .row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -15px;
        }
        
        .col-lg-6, .col-lg-7, .col-lg-5, .col-12 {
          padding: 0 15px;
        }
        
        .col-lg-6 {
          flex: 0 0 50%;
          max-width: 50%;
        }
        
        .col-lg-7 {
          flex: 0 0 58.333333%;
          max-width: 58.333333%;
        }
        
        .col-lg-5 {
          flex: 0 0 41.666667%;
          max-width: 41.666667%;
        }
        
        .col-12 {
          flex: 0 0 100%;
          max-width: 100%;
        }
        
        .col-md-6 {
          flex: 0 0 50%;
          max-width: 50%;
        }
        
        .mb-3 {
          margin-bottom: 1rem;
        }
        
        .mb-4 {
          margin-bottom: 1.5rem;
        }
        
        .w-100 {
          width: 100%;
        }
        
        .g-2 {
          gap: 0.5rem;
        }
        
        .text-center {
          text-align: center;
        }
        
        .justify-content-center {
          justify-content: center;
        }
        
        .pagination {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }
        
        .page-item {
          margin: 0 2px;
        }
        
        .page-link {
          display: block;
          padding: 8px 12px;
          text-decoration: none;
          background-color: #fff;
          border: 1px solid #dee2e6;
          color: #007bff;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .page-item.active .page-link {
          background-color: #007bff;
          border-color: #007bff;
          color: white;
        }
        
        .table-responsive {
          overflow-x: auto;
        }
        
        @media (max-width: 768px) {
          .main-container {
            padding: 15px;
          }
          
          .header-title {
            font-size: 2rem;
          }
          
          .card-body-modern {
            padding: 20px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .col-lg-6, .col-lg-7, .col-lg-5 {
            flex: 0 0 100%;
            max-width: 100%;
          }
          
          .col-md-6 {
            flex: 0 0 100%;
            max-width: 100%;
          }
        }
      `}</style>

      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <img src={Logo} alt="#" />
          <h1 className="header-title">Buku Tamu<br />Barokah Tour and Travel</h1>
        </div>

        <div className="row">
          <div className="col-lg-6 mb-4">
            <button 
              type="button" 
              className={`btn-modern w-100 ${currentView === 'peserta' ? 'btn-primary-modern' : ''}`}
              onClick={() => switchView('peserta')}
            >
              <i className="fas fa-user-edit me-2"></i> Pengunjung
            </button>
          </div>
          <div className="col-lg-6 mb-4">
            <button 
              type="button" 
              className={`btn-modern w-100 ${currentView === 'marketing' ? 'btn-primary-modern' : ''}`}
              onClick={() => switchView('marketing')}
            >
              <i className="fas fa-user-edit me-2"></i> Marketing
            </button>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-5 mb-4">
            <div className="stats-card">
              <h4 className="text-center mb-4">
                <i className="fas fa-chart-bar me-2"></i>
                {currentView === 'peserta' ? 'Statistik Pengunjung' : 'Statistik Marketing'}
              </h4>
              <table className="stats-table mx-auto">
                <tbody>
                  <tr>
                    <td><i className="fas fa-calendar-day me-2"></i> Hari ini</td>
                    <td><strong>{currentView === 'peserta' ? stats.today : marketingStats.today}</strong></td>
                  </tr>
                  <tr>
                    <td><i className="fas fa-calendar-minus me-2"></i> Kemarin</td>
                    <td><strong>{currentView === 'peserta' ? stats.yesterday : marketingStats.yesterday}</strong></td>
                  </tr>
                  <tr>
                    <td><i className="fas fa-calendar-week me-2"></i> Minggu ini</td>
                    <td><strong>{currentView === 'peserta' ? stats.week : marketingStats.week}</strong></td>
                  </tr>
                  <tr>
                    <td><i className="fas fa-calendar-alt me-2"></i> Bulan ini</td>
                    <td><strong>{currentView === 'peserta' ? stats.month : marketingStats.month}</strong></td>
                  </tr>
                  <tr>
                    <td><i className="fas fa-users me-2"></i> Keseluruhan</td>
                    <td><strong>{currentView === 'peserta' ? stats.total : marketingStats.total}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="row">
          <div className="col-12">
            <div className="modern-card">
              <div className="card-header-modern">
                <i className="fas fa-table me-2"></i> 
                {currentView === 'peserta' ? 'Data Pengunjung' : 'Data Marketing'} Hari Ini - {getCurrentDate()}
              </div>
              <div className="card-body-modern">
                <div className="action-buttons">
                  <a href="rekapitulasi" className="btn-modern btn-primary-modern">
                    <i className="fas fa-table me-2"></i>Rekapitulasi {currentView === 'peserta' ? 'Pengunjung' : 'Marketing'}
                  </a>
                </div>

                {renderTable()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BukuTamu;