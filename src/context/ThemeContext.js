import React, { createContext, useState, useEffect } from 'react';

// Buat Context
export const ThemeContext = createContext();

// Buat Provider (pembungkus)
export const ThemeProvider = ({ children }) => {
  // State untuk menyimpan tema saat ini, defaultnya 'light'
  const [theme, setTheme] = useState('light');

  // Fungsi untuk mengganti tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Efek untuk menambahkan class ke body saat tema berubah
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
