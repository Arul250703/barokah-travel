import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Ambil auth dari localStorage
  const isAuthenticated = localStorage.getItem("auth") === "true";

  // Kalau sudah login → bisa akses (Outlet)
  // Kalau belum login → redirect ke /admin
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default ProtectedRoute;
