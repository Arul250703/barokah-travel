// components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useRouteProtection } from '../context/RouteProtectionContext';

const ProtectedRoute = ({ 
  children, 
  requiredAccess = false,
  redirectTo = '/', 
  condition = null,
  allowedRoles = [],
  requiresAuth = false
}) => {
  const location = useLocation();
  const { allowedRoutes } = useRouteProtection();

  // Check authentication if required
  const checkAuth = () => {
    if (requiresAuth) {
      const authToken = localStorage.getItem('authToken');
      const adminAuth = localStorage.getItem('adminAuth');
      return authToken || adminAuth;
    }
    return true;
  };

  // Check user role if specified
  const checkRole = () => {
    if (allowedRoles.length > 0) {
      const userRole = localStorage.getItem('userRole') || 'user';
      return allowedRoles.includes(userRole);
    }
    return true;
  };

  // Main access check
  const hasAccess = () => {
    // Check custom condition first
    if (condition && !condition()) {
      return false;
    }

    // Check authentication
    if (!checkAuth()) {
      return false;
    }

    // Check role
    if (!checkRole()) {
      return false;
    }

    // Check if route is in allowed routes
    if (requiredAccess && !allowedRoutes.includes(location.pathname)) {
      // Check for dynamic routes
      const isDynamicAllowed = () => {
        if (location.pathname.startsWith('/travel/') && allowedRoutes.includes('/travel')) {
          return true;
        }
        if (location.pathname.startsWith('/tiket/') && allowedRoutes.includes('/tiket')) {
          return true;
        }
        return false;
      };

      return isDynamicAllowed();
    }

    return true;
  };

  useEffect(() => {
    if (!hasAccess()) {
      console.warn(`🔒 Protected Route: Akses ditolak ke ${location.pathname}`);
    }
  }, [location.pathname]);

  // If no access, redirect
  if (!hasAccess()) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;