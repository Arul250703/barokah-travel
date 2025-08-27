// hooks/useSecureNavigation.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteProtection } from '../context/RouteProtectionContext';

export const useSecureNavigation = () => {
  const navigate = useNavigate();
  const { allowRoute, allowMultipleRoutes, safeNavigate, resetToPublicRoutes } = useRouteProtection();

  // Basic secure navigation
  const navigateWithAccess = useCallback((route, options = {}) => {
    console.log(`🔗 Navigating to: ${route}`);
    safeNavigate(route, options);
  }, [safeNavigate]);

  // Navigation untuk proses booking dan pembayaran
  const navigateToBooking = useCallback((bookingData) => {
    if (!bookingData || !bookingData.isValid) {
      console.error('❌ Invalid booking data');
      return;
    }

    console.log('💳 Opening payment flow...');
    
    // Buka akses untuk seluruh flow pembayaran
    const paymentRoutes = [
      '/pembayaran',
      '/invoice', 
      '/virtual-account',
      '/payment-status',
      '/tiket'
    ];
    
    allowMultipleRoutes(paymentRoutes);
    
    // Navigate dengan data
    navigate('/pembayaran', { 
      state: { bookingData },
      replace: true 
    });
  }, [navigate, allowMultipleRoutes]);

  // Navigation untuk admin dengan authentication
  const navigateToAdmin = useCallback((credentials = null) => {
    // Check jika sudah ada admin auth
    const existingAuth = localStorage.getItem('adminAuth');
    
    if (existingAuth === 'true') {
      console.log('👑 Admin already authenticated, navigating to dashboard...');
      
      const adminRoutes = [
        '/admin',
        '/dashboard',
        '/keuangan',
        '/qr-page',
        '/settings',
        '/bukutamu',
        '/users',
        '/event',
        '/bookings',
        '/reports'
      ];
      
      allowMultipleRoutes(adminRoutes);
      navigate('/dashboard', { replace: true });
      return;
    }

    // Jika ada credentials, validate
    if (credentials && credentials.isValid) {
      console.log('👑 Admin authentication successful');
      
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('userRole', 'admin');
      
      const adminRoutes = [
        '/admin',
        '/dashboard', 
        '/keuangan',
        '/qr-page',
        '/settings',
        '/bukutamu',
        '/users',
        '/event',
        '/bookings', 
        '/reports'
      ];
      
      allowMultipleRoutes(adminRoutes);
      navigate('/dashboard', { replace: true });
    } else {
      console.log('🔐 Navigating to admin login...');
      allowRoute('/admin');
      navigate('/admin', { replace: true });
    }
  }, [navigate, allowRoute, allowMultipleRoutes]);

  // Navigation ke halaman cabang tertentu
  const navigateToBranch = useCallback((branchName) => {
    const branchRoutes = {
      sukabumi: '/sukabumi',
      pelabuan: '/pelabuan', 
      yogyakarta: '/yogyakarta',
      semarang: '/semarang',
      surabaya: '/surabaya'
    };

    const route = branchRoutes[branchName.toLowerCase()];
    if (route) {
      console.log(`🏢 Navigating to branch: ${branchName}`);
      allowRoute(route);
      navigate(route);
    } else {
      console.error(`❌ Branch not found: ${branchName}`);
    }
  }, [allowRoute, navigate]);

  // Navigation untuk scanner (khusus admin/staff)
  const navigateToScanner = useCallback(() => {
    const userRole = localStorage.getItem('userRole');
    const adminAuth = localStorage.getItem('adminAuth');
    
    if (adminAuth === 'true' || userRole === 'admin') {
      console.log('📱 Opening scanner for admin/staff...');
      allowRoute('/scanner');
      navigate('/scanner');
    } else {
      console.warn('🚫 Scanner access denied: Admin role required');
    }
  }, [allowRoute, navigate]);

  // Logout dan reset routes
  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    
    // Clear all auth data
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    // Reset ke public routes saja
    resetToPublicRoutes();
    
    // Navigate ke home
    navigate('/', { replace: true });
  }, [resetToPublicRoutes, navigate]);

  // Check user access
  const checkUserAccess = useCallback(() => {
    const authToken = localStorage.getItem('authToken');
    const adminAuth = localStorage.getItem('adminAuth');
    return !!(authToken || adminAuth);
  }, []);

  // Get current user role
  const getCurrentUserRole = useCallback(() => {
    return localStorage.getItem('userRole') || 'user';
  }, []);

  // Navigation ke halaman tiket dengan ID
  const navigateToTicket = useCallback((ticketId) => {
    if (!ticketId) {
      console.error('❌ Ticket ID required');
      return;
    }

    console.log(`🎫 Navigating to ticket: ${ticketId}`);
    allowRoute('/tiket');
    allowRoute(`/tiket/${ticketId}`);
    navigate(`/tiket/${ticketId}`);
  }, [allowRoute, navigate]);

  return {
    navigateWithAccess,
    navigateToBooking,
    navigateToAdmin,
    navigateToBranch,
    navigateToScanner,
    navigateToTicket,
    logout,
    checkUserAccess,
    getCurrentUserRole
  };
};