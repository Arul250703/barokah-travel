import React, { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [validNavigations, setValidNavigations] = useState(new Set());
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [isDirectAccess, setIsDirectAccess] = useState(false);

  useEffect(() => {
    // Detect if user came directly to the page (refresh or direct URL)
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation && navigation.type === 'reload') {
      setIsDirectAccess(true);
      console.warn('Page refresh detected - marking as direct access');
    }

    // Check if user came from external source
    if (!document.referrer || !document.referrer.includes(window.location.origin)) {
      setIsDirectAccess(true);
      console.warn('External navigation detected - marking as direct access');
    }

    // Listen for browser back/forward navigation
    const handlePopState = (event) => {
      console.warn('Browser navigation detected');
      // You can add additional logic here to handle back/forward navigation
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Mark navigation as valid (called from components/links)
  const allowNavigation = (path) => {
    const targetPath = path || window.location.pathname;
    setValidNavigations(prev => new Set([...prev, targetPath]));
    setNavigationHistory(prev => [...prev, { path: targetPath, timestamp: Date.now() }]);
    setIsDirectAccess(false);
  };

  // Check if navigation to path is valid
  const isValidNavigation = (path) => {
    // Allow public routes always
    const publicRoutes = ['/', '/tentang', '/layanan', '/travel', '/cabang', '/login', '/register'];
    if (publicRoutes.includes(path)) {
      return true;
    }

    // Check if navigation was marked as valid
    if (validNavigations.has(path)) {
      return true;
    }

    // Check navigation history for recent valid navigation
    const recentNavigation = navigationHistory
      .filter(nav => Date.now() - nav.timestamp < 10000) // 10 seconds
      .find(nav => nav.path === path);
    
    if (recentNavigation) {
      return true;
    }

    // If it's direct access to protected routes, deny
    if (isDirectAccess) {
      return false;
    }

    return false;
  };

  // Mark current navigation as valid
  const markNavigationAsValid = () => {
    const currentPath = window.location.pathname;
    allowNavigation(currentPath);
  };

  // Clear navigation history (useful for logout)
  const clearNavigationHistory = () => {
    setValidNavigations(new Set());
    setNavigationHistory([]);
    setIsDirectAccess(false);
  };

  // Get safe navigation function
  const navigateSafely = (navigate, path, options = {}) => {
    allowNavigation(path);
    navigate(path, options);
  };

  // Check if user has permission to access path based on navigation history
  const hasNavigationPermission = (path) => {
    // Check if user has navigated through proper flow
    const hasProperFlow = navigationHistory.some(nav => 
      nav.timestamp > Date.now() - 300000 && // 5 minutes
      (nav.path === '/' || nav.path === '/login' || nav.path === '/dashboard')
    );

    return hasProperFlow || isValidNavigation(path);
  };

  // Debug function to log navigation state
  const debugNavigation = () => {
    console.log('Navigation State:', {
      validNavigations: Array.from(validNavigations),
      navigationHistory,
      isDirectAccess,
      currentPath: window.location.pathname
    });
  };

  const value = {
    allowNavigation,
    isValidNavigation,
    markNavigationAsValid,
    clearNavigationHistory,
    navigateSafely,
    hasNavigationPermission,
    debugNavigation,
    isDirectAccess,
    navigationHistory: navigationHistory.slice(-10) // Keep only last 10 navigations
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};