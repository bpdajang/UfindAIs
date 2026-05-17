import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("ufoundai_user");
    const storedToken = localStorage.getItem("ufoundai_token");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
  }, []);

  const login = ({ user: u, access_token } = {}) => {
    if (u) {
      localStorage.setItem("ufoundai_user", JSON.stringify(u));
      setUser(u);
    }
    if (access_token) {
      localStorage.setItem("ufoundai_token", access_token);
      setToken(access_token);
    }
  };

  const logout = () => {
    localStorage.removeItem("ufoundai_user");
    localStorage.removeItem("ufoundai_token");
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
