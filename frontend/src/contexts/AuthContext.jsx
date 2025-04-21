import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser = localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData"))
    : null;

  const [userData, setUserData] = useState(storedUser || null);
  const [token, setToken] = useState(storedUser?.token || null);
  const [role, setRole] = useState(storedUser?.role || "guest");
  const [username, setUsername] = useState(storedUser?.username || null);

  // ✅ Sync ทุกอย่างจาก userData ทันทีเมื่อมีการ login
  useEffect(() => {
    if (userData) {
      setToken(userData.token || null);
      setRole(userData.role || "guest");
      setUsername(userData.username || null);
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [userData]);

  const logout = () => {
    setUserData(null);
    setToken(null);
    setRole("guest");
    setUsername(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        role,
        setRole,
        username,
        setUsername,
        userData,
        setUserData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
