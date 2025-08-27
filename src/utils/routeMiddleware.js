// utils/routeMiddleware.js

export const routeMiddleware = {
  // Validasi untuk route admin
  adminAccess: (user = null) => {
    const adminAuth = localStorage.getItem('adminAuth');
    const userRole = localStorage.getItem('userRole');
    
    if (user) {
      return user.role === 'admin' && user.isAuthenticated;
    }
    
    return adminAuth === 'true' && userRole === 'admin';
  },

  // Validasi untuk proses pembayaran
  paymentAccess: (bookingData = null) => {
    if (bookingData) {
      return bookingData.isValid && bookingData.bookingId;
    }
    
    // Check if user has active booking session
    const bookingSession = sessionStorage.getItem('activeBooking');
    return !!bookingSession;
  },

  // Validasi untuk halaman tiket
  ticketAccess: (ticketId = null) => {
    if (ticketId) {
      return ticketId.length > 0;
    }
    
    // Check if user has valid ticket session
    const ticketSession = sessionStorage.getItem('validTicket');
    return !!ticketSession;
  },

  // Validasi untuk scanner (admin/staff only)
  scannerAccess: () => {
    const adminAuth = localStorage.getItem('adminAuth');
    const userRole = localStorage.getItem('userRole');
    
    return adminAuth === 'true' || userRole === 'admin' || userRole === 'staff';
  },

  // Generate allowed routes based on user context
  generateAllowedRoutes: (userContext = {}) => {
    const baseRoutes = ['/', '/tentang', '/layanan', '/travel', '/cabang'];
    
    // Admin routes
    if (userContext.isAdmin || routeMiddleware.adminAccess()) {
      const adminRoutes = [
        '/admin', '/dashboard', '/keuangan', '/qr-page', 
        '/settings', '/bukutamu', '/users', '/scanner',
        '/event', '/bookings', '/reports'
      ];
      return [...baseRoutes, ...adminRoutes];
    }
    
    // User with active booking
    if (userContext.hasActiveBooking || routeMiddleware.paymentAccess()) {
      const paymentRoutes = [
        '/pembayaran', '/invoice', '/virtual-account', 
        '/payment-status', '/tiket'
      ];
      return [...baseRoutes, ...paymentRoutes];
    }
    
    // User with valid ticket
    if (userContext.hasValidTicket || routeMiddleware.ticketAccess()) {
      return [...baseRoutes, '/tiket'];
    }
    
    // Branch access (you can customize this based on user location/selection)
    const branchRoutes = ['/sukabumi', '/pelabuan', '/yogyakarta', '/semarang', '/surabaya'];
    
    return [...baseRoutes, ...branchRoutes, '/register', '/halamanbukutamu'];
  },

  // Check if route requires authentication
  requiresAuth: (route) => {
    const authRequiredRoutes = [
      '/dashboard', '/keuangan', '/qr-page', '/settings', 
      '/bukutamu', '/users', '/scanner', '/event', 
      '/bookings', '/reports'
    ];
    
    return authRequiredRoutes.includes(route);
  },

  // Check if route is admin only
  isAdminRoute: (route) => {
    const adminRoutes = [
      '/admin', '/dashboard', '/keuangan', '/qr-page', 
      '/settings', '/bukutamu', '/users', '/scanner',
      '/event', '/bookings', '/reports'
    ];
    
    return adminRoutes.includes(route);
  },

  // Check if route is payment flow
  isPaymentRoute: (route) => {
    const paymentRoutes = [
      '/pembayaran', '/invoice', '/virtual-account', '/payment-status'
    ];
    
    return paymentRoutes.includes(route);
  },

  // Validate booking session
  validateBookingSession: () => {
    const bookingData = sessionStorage.getItem('activeBooking');
    
    if (!bookingData) {
      return false;
    }
    
    try {
      const booking = JSON.parse(bookingData);
      const now = new Date().getTime();
      const bookingTime = new Date(booking.timestamp).getTime();
      const timeDiff = now - bookingTime;
      
      // Session expires after 30 minutes
      if (timeDiff > 30 * 60 * 1000) {
        sessionStorage.removeItem('activeBooking');
        return false;
      }
      
      return booking.isValid;
    } catch (error) {
      sessionStorage.removeItem('activeBooking');
      return false;
    }
  },

  // Create booking session
  createBookingSession: (bookingData) => {
    const sessionData = {
      ...bookingData,
      timestamp: new Date().toISOString(),
      isValid: true
    };
    
    sessionStorage.setItem('activeBooking', JSON.stringify(sessionData));
    console.log('💳 Booking session created');
  },

  // Clear booking session
  clearBookingSession: () => {
    sessionStorage.removeItem('activeBooking');
    console.log('💳 Booking session cleared');
  },

  // Validate admin session
  validateAdminSession: () => {
    const adminAuth = localStorage.getItem('adminAuth');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!adminAuth || !loginTime) {
      return false;
    }
    
    const now = new Date().getTime();
    const loginTimestamp = parseInt(loginTime);
    const timeDiff = now - loginTimestamp;
    
    // Admin session expires after 8 hours
    if (timeDiff > 8 * 60 * 60 * 1000) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminLoginTime');
      localStorage.removeItem('userRole');
      return false;
    }
    
    return adminAuth === 'true';
  },

  // Create admin session
  createAdminSession: () => {
    const timestamp = new Date().getTime().toString();
    localStorage.setItem('adminAuth', 'true');
    localStorage.setItem('adminLoginTime', timestamp);
    localStorage.setItem('userRole', 'admin');
    console.log('👑 Admin session created');
  },

  // Clear admin session
  clearAdminSession: () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('userRole');
    console.log('👑 Admin session cleared');
  },

  // Get user context
  getUserContext: () => {
    const adminAuth = routeMiddleware.validateAdminSession();
    const hasActiveBooking = routeMiddleware.validateBookingSession();
    const userRole = localStorage.getItem('userRole') || 'user';
    
    return {
      isAdmin: adminAuth,
      hasActiveBooking,
      userRole,
      isAuthenticated: !!(adminAuth || localStorage.getItem('authToken'))
    };
  },

  // Log access attempts for monitoring
  logAccess: (route, allowed = true, reason = '') => {
    const timestamp = new Date().toISOString();
    const userRole = localStorage.getItem('userRole') || 'user';
    const status = allowed ? '✅ ALLOWED' : '❌ DENIED';
    
    console.log(`[${timestamp}] ${status} - Route: ${route} - Role: ${userRole} - Reason: ${reason}`);
    
    // You could send this to an analytics service or store in localStorage for debugging
    const accessLog = JSON.parse(localStorage.getItem('accessLog') || '[]');
    accessLog.push({
      timestamp,
      route,
      allowed,
      reason,
      userRole
    });
    
    // Keep only last 100 entries
    if (accessLog.length > 100) {
      accessLog.splice(0, accessLog.length - 100);
    }
    
    localStorage.setItem('accessLog', JSON.stringify(accessLog));
  }
};