// hooks/useBrowserProtection.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useBrowserProtection = (options = {}) => {
  const navigate = useNavigate();
  
  const {
    disableRightClick = true,
    disableDevTools = true,
    disableViewSource = true,
    showWarnings = true,
    blockAddressBar = true,
    preventBackForward = false
  } = options;

  useEffect(() => {
    console.log('🛡️ Browser protection activated');

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      if (disableRightClick) {
        e.preventDefault();
        if (showWarnings) {
          console.warn('🚫 Right-click disabled');
        }
        return false;
      }
    };

    // Disable various keyboard shortcuts
    const handleKeyDown = (e) => {
      // F12 - Developer Tools
      if (disableDevTools && e.keyCode === 123) {
        e.preventDefault();
        if (showWarnings) {
          console.warn('🚫 Developer tools access blocked');
        }
        return false;
      }
      
      // Ctrl+Shift+I - Developer Tools
      if (disableDevTools && e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        if (showWarnings) {
          console.warn('🚫 Developer tools access blocked');
        }
        return false;
      }
      
      // Ctrl+Shift+C - Element inspector
      if (disableDevTools && e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        if (showWarnings) {
          console.warn('🚫 Element inspector blocked');
        }
        return false;
      }
      
      // Ctrl+U - View Source
      if (disableViewSource && e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        if (showWarnings) {
          console.warn('🚫 View source blocked');
        }
        return false;
      }
      
      // Ctrl+Shift+J - Console
      if (disableDevTools && e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        if (showWarnings) {
          console.warn('🚫 Console access blocked');
        }
        return false;
      }

      // Ctrl+L - Focus address bar
      if (blockAddressBar && e.ctrlKey && e.keyCode === 76) {
        e.preventDefault();
        if (showWarnings) {
          console.warn('🚫 Address bar focus blocked');
        }
        return false;
      }

      // Alt+D - Focus address bar (alternative)
      if (blockAddressBar && e.altKey && e.keyCode === 68) {
        e.preventDefault();
        if (showWarnings) {
          console.warn('🚫 Address bar focus blocked');
        }
        return false;
      }
    };

    // Prevent back/forward navigation with warning
    const handleBeforeUnload = (e) => {
      if (preventBackForward) {
        const message = 'Anda yakin ingin meninggalkan halaman ini?';
        e.returnValue = message;
        return message;
      }
    };

    // Override browser history methods
    let originalPushState, originalReplaceState;
    
    const overrideHistoryMethods = () => {
      originalPushState = window.history.pushState;
      originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(...args) {
        console.warn('🚫 Direct URL manipulation detected (pushState)');
        if (showWarnings) {
          alert('Navigasi langsung melalui URL tidak diizinkan!');
        }
        // Redirect to home instead
        navigate('/', { replace: true });
      };
      
      window.history.replaceState = function(...args) {
        console.warn('🚫 Direct URL manipulation detected (replaceState)');
        if (showWarnings) {
          alert('Manipulasi URL tidak diizinkan!');
        }
        // Redirect to home instead
        navigate('/', { replace: true });
      };
    };

    // Detect manual URL changes
    const handlePopState = (e) => {
      console.warn('🚫 Manual navigation detected');
      // You can add additional logic here to validate the navigation
    };

    // Disable text selection (optional)
    const disableSelection = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop (optional)
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Detect if developer tools are open
    let devtools = false;
    const detectDevTools = () => {
      const threshold = 160;
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools) {
            devtools = true;
            console.warn('🚫 Developer tools detected!');
            if (showWarnings) {
              alert('Developer tools terdeteksi! Halaman akan dimuat ulang.');
              window.location.reload();
            }
          }
        } else {
          devtools = false;
        }
      }, 500);
    };

    // Apply all protections
    if (disableRightClick) {
      document.addEventListener('contextmenu', handleContextMenu);
    }
    
    document.addEventListener('keydown', handleKeyDown);
    
    if (preventBackForward) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    window.addEventListener('popstate', handlePopState);
    
    // Uncomment these if you want more aggressive protection
    // document.addEventListener('selectstart', disableSelection);
    // document.addEventListener('dragstart', handleDragStart);
    
    overrideHistoryMethods();
    detectDevTools();

    // Cleanup function
    return () => {
      console.log('🛡️ Browser protection deactivated');
      
      if (disableRightClick) {
        document.removeEventListener('contextmenu', handleContextMenu);
      }
      
      document.removeEventListener('keydown', handleKeyDown);
      
      if (preventBackForward) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      
      window.removeEventListener('popstate', handlePopState);
      
      // document.removeEventListener('selectstart', disableSelection);
      // document.removeEventListener('dragstart', handleDragStart);
      
      // Restore original history methods
      if (originalPushState) {
        window.history.pushState = originalPushState;
      }
      if (originalReplaceState) {
        window.history.replaceState = originalReplaceState;
      }
    };
  }, [
    disableRightClick,
    disableDevTools, 
    disableViewSource,
    showWarnings,
    blockAddressBar,
    preventBackForward,
    navigate
  ]);

  // Return utility functions
  return {
    // Function to temporarily disable protection
    toggleProtection: (enabled) => {
      console.log(enabled ? '🛡️ Protection enabled' : '⚠️ Protection disabled');
    }
  };
};