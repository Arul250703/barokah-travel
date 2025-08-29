import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';

export const useSafeNavigation = () => {
  const navigate = useNavigate();
  const { allowNavigation, navigateSafely } = useNavigation();
  const { isAuthenticated, user } = useAuth();

  // Safe navigation function yang mengecek permission
  const safeNavigate = (path, options = {}) => {
    // Check if user has permission for the target route
    const isAdminRoute = path.startsWith('/dashboard') || path.startsWith('/admin') || 
                        path.startsWith('/keuangan') || path.startsWith('/settings') ||
                        path.startsWith('/users') || path.startsWith('/bukutamu') ||
                        path.startsWith('/scanner') || path.startsWith('/qr-page');

    const isProtectedRoute = path.startsWith('/pembayaran') || path.startsWith('/invoice') ||
                            path.startsWith('/virtual-account') || path.startsWith('/payment-status') ||
                            path.startsWith('/tiket');

    // Block unauthorized access
    if (isAdminRoute && (!isAuthenticated || user?.role !== 'admin')) {
      console.warn('Unauthorized admin navigation attempt to:', path);
      navigate('/unauthorized', { replace: true });
      return;
    }

    if (isProtectedRoute && !isAuthenticated) {
      console.warn('Unauthorized protected navigation attempt to:', path);
      navigate('/login', { replace: true });
      return;
    }

    // Mark navigation as valid and navigate
    navigateSafely(navigate, path, options);
  };

  // Navigation dengan delay untuk prevent spam
  const safeNavigateWithDelay = (path, options = {}, delay = 300) => {
    setTimeout(() => {
      safeNavigate(path, options);
    }, delay);
  };

  // Check if navigation to path is allowed
  const canNavigateTo = (path) => {
    const isAdminRoute = path.startsWith('/dashboard') || path.startsWith('/admin') || 
                        path.startsWith('/keuangan') || path.startsWith('/settings') ||
                        path.startsWith('/users') || path.startsWith('/bukutamu') ||
                        path.startsWith('/scanner') || path.startsWith('/qr-page');

    const isProtectedRoute = path.startsWith('/pembayaran') || path.startsWith('/invoice') ||
                            path.startsWith('/virtual-account') || path.startsWith('/payment-status') ||
                            path.startsWith('/tiket');

    if (isAdminRoute && (!isAuthenticated || user?.role !== 'admin')) {
      return false;
    }

    if (isProtectedRoute && !isAuthenticated) {
      return false;
    }

    return true;
  };

  // Navigate back with safety check
  const safeGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      allowNavigation(window.location.pathname);
      navigate(-1);
    } else {
      // Fallback to home if no history
      safeNavigate('/');
    }
  };

  // Navigate to dashboard based on user role
  const navigateToDashboard = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        safeNavigate('/dashboard');
      } else {
        safeNavigate('/');
      }
    } else {
      safeNavigate('/login');
    }
  };

  return {
    safeNavigate,
    safeNavigateWithDelay,
    canNavigateTo,
    safeGoBack,
    navigateToDashboard,
    // Expose original navigate for emergency cases
    navigate: safeNavigate
  };
};