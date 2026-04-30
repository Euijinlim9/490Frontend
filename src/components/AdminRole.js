import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function AdminRole({ children }) {
  const { activeRole, loading } = useContext(AuthContext);

  if (loading) return 
  <div>Loading...</div>;
  
  if (!activeRole) return <Navigate to="/login" />;
  if (activeRole !== "admin") return <Navigate to="/dashboard" />;

  return children;
}

export default AdminRole;