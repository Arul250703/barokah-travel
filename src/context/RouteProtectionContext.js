// context/RouteProtectionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RouteProtectionContext = createContext();

export const useRouteProtection = () => {
  const context = useContext(RouteProtectionContext);
  if (!context) {
    throw new Error('useRouteProtection must be used within RouteProtectionProvider');
  }
  return context;
};

export const RouteProtectionProvider = ({ children }) => {
  const [allowedRoutes, setAllowedRoutes] = useState(new Set(['/', '/tentang', '/layanan', '/travel', '/cabang']));
  const [navigationHistory, setNavigationHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Fungsi untuk mengizinkan route tertentu
  const allowRoute = (route) => {
    setAllowedRoutes(prev => new Set([...prev, route]));
  };

  // Fungsi untuk menolak akses route
  const denyRoute = (route) => {
    setAllowedRoutes(prev => {
      const newSet = new Set(prev);
      newSet.delete(route);
      return newSet;
    });
  };

  // Fungsi untuk navigasi yang aman
  const safeNavigate = (route, options = {}) => {
    allowRoute(route);
    setNavigationHistory(prev => [...prev, location.pathname]);
    navigate(route, options);
  };

  // Reset routes (untuk logout admin, dll)
  const resetToPublicRoutes = () => {
    setAllowedRoutes(new Set(['/', '/tentang', '/layanan', '/travel', '/cabang']));
  };

  // Allow multiple routes at once
  const allowMultipleRoutes = (routes) => {
    setAllowedRoutes(prev => new Set([...prev, ...routes]));
  };

  // Cek apakah route saat ini diizinkan
  useEffect(() => {
    const currentRoute = location.pathname;
    
    // Check for dynamic routes (like /travel/:id)
    const isDynamicRouteAllowed = () => {
      if (currentRoute.startsWith('/travel/') && allowedRoutes.has('/travel')) {
        return true;
      }
      if (currentRoute.startsWith('/tiket/') && allowedRoutes.has('/tiket')) {
        return true;
      }
      return false;
    };
    
    if (!allowedRoutes.has(currentRoute) && !isDynamicRouteAllowed()) {
      console.warn(`❌ Akses ditolak ke: ${currentRoute}`);
      navigate('/', { replace: true });
    } else {
      console.log(`✅ Akses diizinkan ke: ${currentRoute}`);
    }
  }, [location.pathname, allowedRoutes, navigate]);

  // Deteksi navigasi manual (back/forward button atau URL typing)
  useEffect(() => {
    const handlePopState = (event) => {
      const currentRoute = window.location.pathname;
      if (!allowedRoutes.has(currentRoute)) {
        event.preventDefault();
        console.warn('🚫 Navigasi manual diblokir');
        navigate('/', { replace: true });
      }
    };

    const handleKeyDown = (event) => {
      // Block Ctrl+L (focus address bar)
      if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        console.warn('🚫 Address bar access blocked');
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [allowedRoutes, navigate]);

  return (
    <RouteProtectionContext.Provider value={{
      allowRoute,
      denyRoute,
      safeNavigate,
      resetToPublicRoutes,
      allowMultipleRoutes,
      allowedRoutes: Array.from(allowedRoutes), // Convert to array for easier debugging
      navigationHistory
    }}>
      {children}
    </RouteProtectionContext.Provider>
  );
};