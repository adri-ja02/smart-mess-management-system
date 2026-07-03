import { createContext, useContext, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 👤 Load user from localStorage (if exists)
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [loading, setLoading] = useState(false);

  /* =========================
      REGISTER
  ========================= */
  const register = async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      return res;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      LOGIN
  ========================= */
  const login = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);

      // 🔐 SAVE USER + TOKEN
      localStorage.setItem("user", JSON.stringify(res));
      localStorage.setItem("token", res.token);

      setUser(res);

      return res;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   CUSTOM HOOK
========================= */
export const useAuth = () => useContext(AuthContext);