import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser = localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData"))
    : null;

  const [token, setToken] = useState(storedUser?.token || null);
  const [role, setRole] = useState(storedUser?.role || "guest");
  const [username, setUsername] = useState(storedUser?.username || null);

  // sync context to localStorage on change
  useEffect(() => {
    if (token && role && username) {
      localStorage.setItem(
        "userData",
        JSON.stringify({ token, role, username })
      );
    }
  }, [token, role, username]);

  // logout helper
  const logout = () => {
    setToken(null);
    setRole("guest");
    setUsername(null);
    localStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider
      value={{ token, setToken, role, setRole, username, setUsername, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};