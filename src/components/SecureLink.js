// components/SecureLink.js
import React from 'react';
import { useSecureNavigation } from '../hooks/useSecureNavigation';

const SecureLink = ({ 
  to, 
  children, 
  className = '', 
  style = {},
  requiresAccess = false,
  requiresAuth = false,
  allowedRoles = [],
  onClick = null,
  disabled = false,
  ...props 
}) => {
  const { navigateWithAccess, checkUserAccess } = useSecureNavigation();

  const handleClick = (e) => {
    e.preventDefault();
    
    if (disabled) return;

    // Run custom onClick if provided
    if (onClick) {
      const result = onClick(e);
      // If onClick returns false, don't navigate
      if (result === false) return;
    }

    // Check access requirements
    if (requiresAuth && !checkUserAccess()) {
      console.warn('🚫 Akses ditolak: Membutuhkan authentication');
      return;
    }

    if (allowedRoles.length > 0) {
      const userRole = localStorage.getItem('userRole') || 'user';
      if (!allowedRoles.includes(userRole)) {
        console.warn('🚫 Akses ditolak: Role tidak sesuai');
        return;
      }
    }

    // Navigate with access
    navigateWithAccess(to);
  };

  const linkStyle = {
    ...style,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    textDecoration: 'none'
  };

  return (
    <a 
      href="#" 
      className={className}
      style={linkStyle}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
};

export default SecureLink;