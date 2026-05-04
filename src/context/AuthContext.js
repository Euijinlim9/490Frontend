import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState(
    localStorage.getItem("activeRole") || null
  );

  const setActiveRole = (role) => {
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem("activeRole", role);
    } else {
      localStorage.removeItem("activeRole");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:4000/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setActiveRole(data.user.role);
        } else if (res.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.log("Auth check failed!", error);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeRole");
    setUser(null);
    setActiveRoleState(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, loading, activeRole, setActiveRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};
