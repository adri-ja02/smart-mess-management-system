import { createContext, useContext, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  /* =========================
      LOAD USER FROM LOCAL STORAGE
  ========================= */
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error("Failed to load user:", error);
      return null;
    }
  });

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

      /*
        Backend now returns:

        {
          _id,
          name,
          email,
          role,
          approvalStatus,
          accountStatus,
          profilePhoto,
          token
        }
      */

      // Save complete user information
      localStorage.setItem(
        "user",
        JSON.stringify(res)
      );

      // Save authentication token
      if (res.token) {
        localStorage.setItem(
          "token",
          res.token
        );
      }

      // Update React state
      setUser(res);

      return res;

    } finally {
      setLoading(false);
    }
  };

  /* =========================
      UPDATE USER
      Used after profile changes
      or profile photo changes
  ========================= */
  const updateUser = (updatedUser) => {
    if (!updatedUser) return;

    // Update React state
    setUser(updatedUser);

    // Update localStorage
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );
  };

  /* =========================
      LOGOUT
  ========================= */
  const logout = () => {
    // Remove authentication information
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Clear current user
    setUser(null);
  };

  /* =========================
      CONTEXT PROVIDER
  ========================= */
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        updateUser,
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
export const useAuth = () => {
  return useContext(AuthContext);
};