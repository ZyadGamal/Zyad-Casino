import React, { createContext, useState, useEffect } from "react";
import * as authService from "../services/auth";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async ({ identifier, password }) => {
    try {
      const res = await authService.login(identifier, password);
      if (res && res.token && res.user) {
        const fullUser = {
          id: res.user.id,
          username: res.user.username,
          balance: res.user.balance,
          email: res.user.email,
          role: res.user.role,
          // أضف أي بيانات إضافية تريدها هنا
        };

        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(fullUser));
        setUser(fullUser);
        return true;
      }
    } catch (err) {
      console.error("Login failed", err);
    }
    return false;
  };

  const register = async ({ username, identifier, password }) => {
    try {
      const res = await authService.register(username, identifier, password);
      if (res && res.token && res.user) {
        const fullUser = {
          id: res.user.id,
          username: res.user.username,
          balance: res.user.balance,
          email: res.user.email,
          role: res.user.role,
          // أضف أي بيانات إضافية هنا أيضًا
        };

        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(fullUser));
        setUser(fullUser);
        return true;
      }
    } catch (err) {
      console.error("Registration failed", err);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
