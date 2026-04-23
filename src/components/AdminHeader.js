import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/AdminHeader.css";

function AdminHeader() {
  const { user, activeRole } = useContext(AuthContext);
  const role = activeRole || user?.role;

  return (

      <div className="nav-admin">

        {role === "admin" && (
          <>
          <h3>ADMIN NAVIGATION</h3>
            <Link to="/admin/coachapp" className="nav-btn">
              Coach Applications
            </Link>
            <Link to="/admin/viewusers" className="nav-btn">
            View Accounts
            </Link>
            <Link to="/admin/exercise" className="nav-btn">
              Exercises
            </Link>
            <Link to="/admin/userreport" className="nav-btn">
              User Reports
            </Link>
          </>
        )}

      </div>
      );
    }

export default AdminHeader;