import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ redirectPath = "/login" }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // blokir akses langsung via URL & redirect ke login
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
