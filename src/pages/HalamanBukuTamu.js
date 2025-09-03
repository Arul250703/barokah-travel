import React, { useState, useEffect } from "react";
import axios from "axios";

const HalamanBukuTamu = () => {
  const [currentView, setCurrentView] = useState("peserta");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({
    today: 0,
    yesterday: 0,
    week: 0,
    month: 0,
    total: 0,
  });
  const [marketingStats, setMarketingStats] = useState({
    today: 0,
    yesterday: 0,
    week: 0,
    month: 0,
    total: 0,
  });
  const [pesertaData, setPesertaData] = useState([]);
  const [marketingData, setMarketingData] = useState([]);
  const [totalPesertaPages, setTotalPesertaPages] = useState(1);
  const [totalMarketingPages, setTotalMarketingPages] = useState(1);

  // API base URL
  const API_BASE = "http://localhost:5000";

  // Fetch data dari API
  useEffect(() => {
    fetchPesertaData();
    fetchMarketingData();
    fetchStats();
  }, [currentPage, currentView]);

  const fetchPesertaData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/peserta?page=${currentPage}`
      );
      setPesertaData(response.data.data);
      setTotalPesertaPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching peserta data:", error);
    }
  };

  const fetchMarketingData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/marketing?page=${currentPage}`
      );
      setMarketingData(response.data.data);
      setTotalMarketingPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching marketing data:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const pesertaResponse = await axios.get(`${API_BASE}/api/stats/peserta`);
      setStats(pesertaResponse.data);

      const marketingResponse = await axios.get(
        `${API_BASE}/api/stats/marketing`
      );
      setMarketingStats(marketingResponse.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formType = currentView;

    try {
      if (formType === "peserta") {
        await axios.post(`${API_BASE}/api/peserta`, formData);
        alert("Data peserta berhasil disimpan!");
      } else {
        const marketingFormData = new FormData();
        for (const key in formData) {
          marketingFormData.append(key, formData[key]);
        }

        await axios.post(`${API_BASE}/api/marketing`, marketingFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Data marketing berhasil disimpan!");
      }

      setFormData({});
      e.target.reset();

      // Refresh data
      fetchPesertaData();
      fetchMarketingData();
      fetchStats();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const renderPagination = (totalPages, onPageChange) => {
    if (totalPages <= 1) return null;

    return (
      <nav>
        <ul className="pagination justify-content-center">
          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
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
    if (currentView === "peserta") {
      return (
        <div className="data-table-container">
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>No</th>
                  <th style={{ width: "120px" }}>Tanggal</th>
                  <th>Nama Pengunjung</th>
                  <th>Alamat</th>
                  <th>Tempat Tanggal Lahir</th>
                  <th>Tujuan</th>
                  <th style={{ width: "140px" }}>No. HP</th>
                </tr>
              </thead>
              <tbody>
                {pesertaData.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{(currentPage - 1) * 10 + index + 1}</strong>
                    </td>
                    <td>{item.tanggal}</td>
                    <td>
                      <strong>{item.nama}</strong>
                    </td>
                    <td>{item.alamat}</td>
                    <td>
                      {item.tempat_lahir},{" "}
                      {new Date(item.tanggal_lahir).toLocaleDateString("id-ID")}
                    </td>
                    <td>{item.tujuan}</td>
                    <td>{item.telepon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(totalPesertaPages, setCurrentPage)}
        </div>
      );
    } else {
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
                {marketingData.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{(currentPage - 1) * 10 + index + 1}</strong>
                    </td>
                    <td>{item.tanggal}</td>
                    <td>
                      <strong>{item.nama}</strong>
                    </td>
                    <td>{item.perusahaan}</td>
                    <td>{item.alamat}</td>
                    <td>{item.nama_kordinator}</td>
                    <td>{item.kota_kordinator}</td>
                    <td>{item.rencana_wisata}</td>
                    <td>
                      {new Date(item.rencana_pemberangkatan).toLocaleDateString(
                        "id-ID"
                      )}
                    </td>
                    <td>{item.destinasi_tujuan}</td>
                    <td>{item.jenis_trip}</td>
                    <td>{item.telepon}</td>
                    <td>
                      {item.foto_kunjungan ? (
                        <img
                          src={`${API_BASE}/uploads/${item.foto_kunjungan}`}
                          style={{ width: "80px" }}
                          alt="Foto"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{item.catatan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(totalMarketingPages, setCurrentPage)}
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
    <div
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <style jsx>{`
        .main-container {
          padding: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .header-section {
          background: #4e73df;;
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
          background: #4e73df;;
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
          padding: 15px;
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
          background: #4e73df;
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
        }
        
        .btn-primary-modern {
          background: #9cb1eeff;
        }
        
        .stats-card {
          background: #6f8de9ff;
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
          padding: 15px;
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
          padding: 12px;
          vertical-align: middle;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          text-align: center;
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
          margin: 0 5px;
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
          
          .col-lg-6, .col-lg-7, .col-lg-5 {
            flex: 0 0 100%;
            max-width: 100%;
          }
        }
      `}</style>

      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <h1 className="header-title">
            Buku Tamu
            <br />
            Barokah Tour and Travel
          </h1>
        </div>

        <div className="row">
          <div className="col-lg-6 mb-4">
            <button
              type="button"
              className={`btn-modern w-100 ${
                currentView === "peserta" ? "btn-primary-modern" : ""
              }`}
              onClick={() => switchView("peserta")}
            >
              Pengunjung
            </button>
          </div>
          <div className="col-lg-6 mb-4">
            <button
              type="button"
              className={`btn-modern w-100 ${
                currentView === "marketing" ? "btn-primary-modern" : ""
              }`}
              onClick={() => switchView("marketing")}
            >
              Marketing
            </button>
          </div>
        </div>

        <div className="row">
          {/* Form Section */}
          <div className="col-lg-7 mb-4">
            <div className="modern-card">
              <div className="card-header-modern">
                {currentView === "peserta"
                  ? "Identitas Pengunjung"
                  : "Identitas Marketing"}
              </div>
              <div className="card-body-modern">
                <form onSubmit={handleSubmit}>
                  {currentView === "peserta" ? (
                    // Form Peserta
                    <>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Nama Lengkap"
                          name="nama"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Alamat Lengkap"
                          name="alamat"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control-modern"
                            placeholder="Tempat Lahir"
                            name="tempat_lahir"
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <input
                            type="date"
                            className="form-control-modern"
                            name="tanggal_lahir"
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Nomor Telepon"
                          name="telepon"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Tujuan Kunjungan"
                          name="tujuan"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <button type="submit" className="btn-modern w-100">
                        Simpan Data
                      </button>
                    </>
                  ) : (
                    // Form Marketing
                    <>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Nama Marketing"
                          name="nama"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Perusahaan"
                          name="perusahaan"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <textarea
                          className="form-control-modern"
                          placeholder="Alamat Instansi"
                          name="alamat"
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Nama Koordinator"
                          name="nama_kordinator"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Kota Koordinator"
                          name="kota_kordinator"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Rencana Wisata"
                          name="rencana_wisata"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="date"
                          className="form-control-modern"
                          name="rencana_pemberangkatan"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Destinasi Tujuan"
                          name="destinasi_tujuan"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <select
                          className="form-control-modern"
                          name="jenis_trip"
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Pilih Jenis Trip</option>
                          <option value="One Day">One Day</option>
                          <option value="Overland">Overland</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control-modern"
                          placeholder="Nomor Telepon"
                          name="telepon"
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          type="file"
                          className="form-control-modern"
                          name="foto_kunjungan"
                          accept="image/*"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <textarea
                          className="form-control-modern"
                          placeholder="Catatan"
                          name="catatan"
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                      <button type="submit" className="btn-modern w-100">
                        Simpan Data Marketing
                      </button>
                    </>
                  )}
                </form>
                <div className="footer-text">
                  By. Barokah Tour and Travel | 2020 - {getCurrentYear()}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="col-lg-5 mb-4">
            <div className="stats-card">
              <h4 className="text-center mb-4">
                {currentView === "peserta"
                  ? "Statistik Pengunjung"
                  : "Statistik Marketing"}
              </h4>
              <table className="stats-table">
                <tbody>
                  <tr>
                    <td>Hari ini</td>
                    <td>
                      <strong>
                        {currentView === "peserta"
                          ? stats.today
                          : marketingStats.today}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Kemarin</td>
                    <td>
                      <strong>
                        {currentView === "peserta"
                          ? stats.yesterday
                          : marketingStats.yesterday}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Minggu ini</td>
                    <td>
                      <strong>
                        {currentView === "peserta"
                          ? stats.week
                          : marketingStats.week}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Bulan ini</td>
                    <td>
                      <strong>
                        {currentView === "peserta"
                          ? stats.month
                          : marketingStats.month}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Keseluruhan</td>
                    <td>
                      <strong>
                        {currentView === "peserta"
                          ? stats.total
                          : marketingStats.total}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Data Table Section */}
            {/* <div className="modern-card">
              <div className="card-header-modern">
                {currentView === 'peserta' ? 'Data Pengunjung' : 'Data Marketing'}
              </div>
              <div className="card-body-modern">
                {renderTable()}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalamanBukuTamu;
