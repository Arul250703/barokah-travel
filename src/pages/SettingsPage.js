import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext'; // Impor context
import styles from '../components/styles/SettingsPage.module.css';
import { FaMoon, FaSun } from 'react-icons/fa';

const SettingsPage = () => {
  // Ambil tema saat ini dan fungsi toggle dari context
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pengaturan</h1>
      
      <div className={styles.settingsCard}>
        <h2 className={styles.cardTitle}>Tampilan</h2>
        
        <div className={styles.settingItem}>
          <div className={styles.settingLabel}>
            <span className={styles.icon}>{theme === 'light' ? <FaSun /> : <FaMoon />}</span>
            Mode Tampilan
          </div>
          <div className={styles.settingControl}>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                onChange={toggleTheme}
                checked={theme === 'dark'}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
