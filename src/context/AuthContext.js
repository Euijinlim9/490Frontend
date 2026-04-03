/* What is Context?
Context is React's built-in way to share data across your entire app without passing props at every level. Think of it like a global variable, but managed properly by React.
You create a "Provider" that holds the data and wraps your app. Any component inside that wrapper can access the data directly — no props needed.
*/

import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info thorugh the JWT Token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = fetch(`${process.env.BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token is invalid or expired
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.log("Failed to fetch user: ", error);
      }
      setLoading(false);
    };

    // Call the function
    fetchUser();
  }, []);

  const logout = () => {
    // remove the token from localStorage
    localStorage.removeItem("token");
    // clean the UI
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
