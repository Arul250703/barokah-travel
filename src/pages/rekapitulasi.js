import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const Rekapitulasi = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('pengunjung');
  const [tanggal1, setTanggal1] = useState(new Date().toISOString().split('T')[0]);
  const [tanggal2, setTanggal2] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Set active tab based on URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const jenis = searchParams.get('jenis');
    if (jenis && ['pengunjung', 'marketing'].includes(jenis)) {
      setActiveTab(jenis);
    }
  }, [location.search]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.get(`/api/rekapitulasi?jenis=${activeTab}&tanggal1=${tanggal1}&tanggal2=${tanggal2}`);
      setData(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel export
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, `rekapitulasi_${activeTab}_${tanggal1}_${tanggal2}.xlsx`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="row">
      <div className="col-md-12 mt-3">
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold">Rekapitulasi</h6>
            <ul className="nav nav-tabs mt-2">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'pengunjung' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('pengunjung');
                    navigate('?jenis=pengunjung');
                  }}
                >
                  Pengunjung
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'marketing' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('marketing');
                    navigate('?jenis=marketing');
                  }}
                >
                  Marketing
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit} className="text-center mb-4">
              <div className="row">
                <div className="col-md-3"></div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Dari Tanggal</label>
                    <input 
                      className="form-control" 
                      type="date" 
                      value={tanggal1}
                      onChange={(e) => setTanggal1(e.target.value)}
                      required
                    /> 
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Hingga Tanggal</label>
                    <input 
                      className="form-control" 
                      type="date" 
                      value={tanggal2}
                      onChange={(e) => setTanggal2(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4"></div>
                <div className="col-md-2 mb-2">
                  <button 
                    className="btn btn-primary form-control" 
                    type="submit"
                    disabled={loading}
                  >
                    <i className="fa fa-search"></i> {loading ? 'Memuat...' : 'Tampilkan'}
                  </button>
                </div>
                <div className="col-md-2 mb-2">
                  <button 
                    className="btn btn-danger form-control"
                    onClick={() => navigate('/admin')}
                    type="button"
                  >
                    <i className="fa fa-backward"></i> Kembali
                  </button>
                </div>
              </div>
            </form>

            {showTable && (
              <>
                <div className="table-responsive">
                  <table className="table table-bordered" width="100%" cellSpacing="0">
                    <thead className="thead-light">
                      <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Nama</th>
                        <th>Alamat</th>

                        {activeTab === 'marketing' ? (
                          <>
                            <th>Perusahaan</th>
                            <th>Nama Koordinator</th>
                            <th>Kota Koordinator</th>
                            <th>Rencana Wisata</th>
                            <th>Rencana Pemberangkatan</th>
                            <th>Destinasi Tujuan</th>
                            <th>Jenis Trip</th>
                            <th>No. HP</th>
                            <th>Foto Kunjungan</th>
                            <th>Catatan</th>
                          </>
                        ) : (
                          <>
                            <th>Tempat, Tanggal Lahir</th>
                            <th>Tujuan</th>
                            <th>No. HP</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{formatDate(item.tanggal)}</td>
                          <td>{item.nama}</td>
                          <td>{item.alamat}</td>

                          {activeTab === 'marketing' ? (
                            <>
                              <td>{item.perusahaan}</td>
                              <td>{item.nama_kordinator}</td>
                              <td>{item.kota_kordinator}</td>
                              <td>{item.rencana_wisata}</td>
                              <td>{formatDate(item.rencana_pemberangkatan)}</td>
                              <td>{item.destinasi_tujuan}</td>
                              <td>{item.jenis_trip}</td>
                              <td>{item.telepon}</td>
                              <td>
                                {item.foto_kunjungan ? (
                                  <img 
                                    src={item.foto_kunjungan.startsWith('data:') 
                                      ? item.foto_kunjungan 
                                      : `/uploads/${item.foto_kunjungan}`} 
                                    style={{width: '80px'}} 
                                    alt="Foto Kunjungan"
                                  />
                                ) : '-'}
                              </td>
                              <td>{item.catatan || '-'}</td>
                            </>
                          ) : (
                            <>
                              <td>
                                {item.tempat_lahir}, {item.tanggal_lahir ? formatDate(item.tanggal_lahir) : '-'}
                              </td>
                              <td>{item.tujuan}</td>
                              <td>{item.telepon}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <center>
                  <div className="col-md-4 mx-auto mt-3">
                    <button 
                      className="btn btn-success form-control" 
                      onClick={handleExport}
                    >
                      <i className="fa fa-download"></i> Download Excel
                    </button>
                  </div>
                </center>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rekapitulasi;