import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import styles from '../components/styles/SettingsPage.module.css';
import { 
  FaMoon, 
  FaSun, 
  FaSave, 
  FaBuilding, 
  FaEnvelope, 
  FaPhone, 
  FaGlobe,
  FaBell,
  FaLanguage,
  FaShieldAlt,
  FaDatabase,
  FaChartLine,
  FaCog,
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard
} from 'react-icons/fa';

const SettingsPage = () => {
  // Ambil tema saat ini dan fungsi toggle dari context
  const { theme, toggleTheme } = useContext(ThemeContext);

  // State untuk menyimpan informasi perusahaan (data contoh)
  const [companyInfo, setCompanyInfo] = useState({
    name: 'PT. Baroka Tour & Travel',
    address: 'Jl. Raya Cibolang No. 21, Sukabumi',
    phone: '083873645789',
    email: 'contact@barokahtour.com',
    website: 'www.barokahtour.com',
    taxId: '01.234.567.8-901.000'
  });

  // State untuk pengaturan notifikasi
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    marketingEmails: false
  });

  // State untuk pengaturan aplikasi
  const [appSettings, setAppSettings] = useState({
    language: 'id',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
    autoSave: true,
    dataBackup: true
  });

  // State untuk pengaturan keamanan
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  // Fungsi untuk menangani perubahan pada input form
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };

  // Fungsi untuk menangani perubahan pengaturan notifikasi
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prevNotifications => ({
      ...prevNotifications,
      [name]: checked
    }));
  };

  // Fungsi untuk menangani perubahan pengaturan aplikasi
  const handleAppSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Fungsi untuk menangani perubahan pengaturan keamanan
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  // Fungsi untuk menyimpan perubahan (saat ini hanya menampilkan alert)
  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log("Menyimpan data:", { companyInfo, notifications, appSettings, securitySettings });
    alert("Pengaturan berhasil disimpan!");
    // Di aplikasi nyata, di sini Anda akan mengirim data ini ke backend
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FaCog className={styles.titleIcon} />
          Pengaturan Sistem
        </h1>
        <p className={styles.subtitle}>Kelola pengaturan aplikasi dan informasi perusahaan</p>
      </div>
      
      <div className={styles.settingsGrid}>
        {/* Kartu untuk Pengaturan Tampilan */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FaSun className={styles.cardIcon} />
              Pengaturan Tampilan
            </h2>
          </div>
          
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Mode Tampilan</span>
              <span className={styles.settingDescription}>
                Pilih antara mode terang atau gelap
              </span>
            </div>
            <div className={styles.settingControl}>
              <div className={styles.themeToggle}>
                <FaSun className={`${styles.themeIcon} ${theme === 'light' ? styles.active : ''}`} />
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    onChange={toggleTheme}
                    checked={theme === 'dark'}
                  />
                  <span className={styles.slider}></span>
                </label>
                <FaMoon className={`${styles.themeIcon} ${theme === 'dark' ? styles.active : ''}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Kartu untuk Pengaturan Aplikasi */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FaGlobe className={styles.cardIcon} />
              Pengaturan Aplikasi
            </h2>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Bahasa</span>
              <span className={styles.settingDescription}>Pilih bahasa interface</span>
            </div>
            <div className={styles.settingControl}>
              <select 
                name="language" 
                value={appSettings.language} 
                onChange={handleAppSettingsChange}
                className={styles.select}
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Mata Uang</span>
              <span className={styles.settingDescription}>Mata uang default untuk transaksi</span>
            </div>
            <div className={styles.settingControl}>
              <select 
                name="currency" 
                value={appSettings.currency} 
                onChange={handleAppSettingsChange}
                className={styles.select}
              >
                <option value="IDR">Rupiah (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Zona Waktu</span>
              <span className={styles.settingDescription}>Zona waktu aplikasi</span>
            </div>
            <div className={styles.settingControl}>
              <select 
                name="timezone" 
                value={appSettings.timezone} 
                onChange={handleAppSettingsChange}
                className={styles.select}
              >
                <option value="Asia/Jakarta">WIB (GMT+7)</option>
                <option value="Asia/Makassar">WITA (GMT+8)</option>
                <option value="Asia/Jayapura">WIT (GMT+9)</option>
              </select>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Simpan Otomatis</span>
              <span className={styles.settingDescription}>Simpan perubahan secara otomatis</span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  name="autoSave"
                  checked={appSettings.autoSave}
                  onChange={handleAppSettingsChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Backup Data</span>
              <span className={styles.settingDescription}>Backup otomatis data harian</span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  name="dataBackup"
                  checked={appSettings.dataBackup}
                  onChange={handleAppSettingsChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Kartu untuk Pengaturan Notifikasi */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FaBell className={styles.cardIcon} />
              Pengaturan Notifikasi
            </h2>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Notifikasi Email</span>
              <span className={styles.settingDescription}>Terima notifikasi melalui email</span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  name="emailNotifications"
                  checked={notifications.emailNotifications}
                  onChange={handleNotificationChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Push Notifications</span>
              <span className={styles.settingDescription}>Notifikasi langsung di browser</span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  name="pushNotifications"
                  checked={notifications.pushNotifications}
                  onChange={handleNotificationChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>SMS Notifications</span>
              <span className={styles.settingDescription}>Notifikasi penting via SMS</span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  name="smsNotifications"
                  checked={notifications.smsNotifications}
                  onChange={handleNotificationChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Email Marketing</span>
              <span className={styles.settingDescription}>Terima email promosi dan penawaran</span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  name="marketingEmails"
                  checked={notifications.marketingEmails}
                  onChange={handleNotificationChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Kartu untuk Pengaturan Keamanan */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FaShieldAlt className={styles.cardIcon} />
              Pengaturan Keamanan
            </h2>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Two-Factor Authentication</span>
              <span className={styles.settingDescription}>Keamanan tambahan dengan 2FA</span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  name="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onChange={handleSecurityChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Session Timeout</span>
              <span className={styles.settingDescription}>Batas waktu sesi (menit)</span>
            </div>
            <div className={styles.settingControl}>
              <input 
                type="number" 
                name="sessionTimeout"
                value={securitySettings.sessionTimeout}
                onChange={handleSecurityChange}
                min="15"
                max="480"
                className={styles.numberInput}
              />
            </div>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Login Alerts</span>
              <span className={styles.settingDescription}>Notifikasi saat ada login baru</span>
            </div>
            <div className={styles.settingControl}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  name="loginAlerts"
                  checked={securitySettings.loginAlerts}
                  onChange={handleSecurityChange}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Kartu untuk Informasi Perusahaan */}
        <div className={`${styles.settingsCard} ${styles.fullWidth}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FaBuilding className={styles.cardIcon} />
              Informasi Perusahaan
            </h2>
          </div>
          
          <form onSubmit={handleSaveChanges} className={styles.companyForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label><FaBuilding /> Nama Perusahaan</label>
                <input 
                  type="text" 
                  name="name" 
                  value={companyInfo.name} 
                  onChange={handleInfoChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label><FaCreditCard /> NPWP</label>
                <input 
                  type="text" 
                  name="taxId" 
                  value={companyInfo.taxId} 
                  onChange={handleInfoChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label><FaPhone /> Nomor Telepon</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={companyInfo.phone} 
                  onChange={handleInfoChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label><FaEnvelope /> Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={companyInfo.email} 
                  onChange={handleInfoChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label><FaGlobe /> Website</label>
                <input 
                  type="url" 
                  name="website" 
                  value={companyInfo.website} 
                  onChange={handleInfoChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label><FaMapMarkerAlt /> Alamat</label>
              <textarea 
                name="address" 
                value={companyInfo.address} 
                onChange={handleInfoChange}
                rows="3"
                className={styles.textarea}
              ></textarea>
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.saveButton}>
                <FaSave /> Simpan Semua Pengaturan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;