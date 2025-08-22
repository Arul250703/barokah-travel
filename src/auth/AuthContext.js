import { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // contoh persist sederhana
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const login = (fakeToken = "token-demo") => {
    localStorage.setItem("token", fakeToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
