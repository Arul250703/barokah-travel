import React from 'react';
import { useSafeNavigation } from '../hooks/SafeNavigation';

const SafeLink = ({ 
  to, 
  children, 
  className = '', 
  style = {}, 
  onClick,
  replace = false,
  state,
  preventDefaultStyle = false,
  ...props 
}) => {
  const { safeNavigate, canNavigateTo } = useSafeNavigation();

  const handleClick = (e) => {
    e.preventDefault();
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Check if navigation is allowed
    if (!canNavigateTo(to)) {
      console.warn('Navigation blocked to:', to);
      return;
    }

    // Perform safe navigation
    safeNavigate(to, { replace, state });
  };

  const defaultStyle = preventDefaultStyle ? {} : {
    textDecoration: 'none',
    color: 'inherit',
    cursor: canNavigateTo(to) ? 'pointer' : 'not-allowed',
    opacity: canNavigateTo(to) ? 1 : 0.6,
    ...style
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      style={defaultStyle}
      {...props}
    >
      {children}
    </a>
  );
};

// Button variant for navigation
export const SafeButton = ({ 
  to, 
  children, 
  onClick,
  disabled = false,
  className = '',
  style = {},
  variant = 'primary',
  ...props 
}) => {
  const { safeNavigate, canNavigateTo } = useSafeNavigation();

  const handleClick = (e) => {
    e.preventDefault();
    
    if (disabled) return;

    // Call custom onClick if provided
    if (onClick) {
      const result = onClick(e);
      // If onClick returns false, don't navigate
      if (result === false) return;
    }

    // Navigate if 'to' is provided
    if (to) {
      if (!canNavigateTo(to)) {
        console.warn('Navigation blocked to:', to);
        return;
      }
      safeNavigate(to);
    }
  };

  const getVariantStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      opacity: disabled ? 0.6 : 1,
      ...style
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        };
      case 'secondary':
        return {
          ...baseStyle,
          background: '#f8f9fa',
          color: '#333',
          border: '1px solid #dee2e6',
        };
      case 'danger':
        return {
          ...baseStyle,
          background: '#dc3545',
          color: 'white',
        };
      case 'success':
        return {
          ...baseStyle,
          background: '#28a745',
          color: 'white',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={className}
      style={getVariantStyle()}
      {...props}
    >
      {children}
    </button>
  );
};

export default SafeLink;