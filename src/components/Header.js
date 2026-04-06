import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import userIcon from "../images/user.svg";
import inboxIcon from "../images/inbox.svg";
import homeIcon from "../images/home.svg";
import { AuthContext } from "../context/AuthContext";
import { useState } from "react";

function Header() {
  const { user, logout, activeRole, setActiveRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="header">
      <div className="logo">logo</div>
      <Link to="/" className="circle">
        <img src={homeIcon} alt="Home icon" className="home-icon" />
      </Link>
      {/* logo can become home button but we need one still */}

      <div className="nav-pill">
        <Link to="/dashboard" className="nav-btn">
          Dashboard
        </Link>
        <Link to="/coach" className="nav-btn">
          Coach
        </Link>
        <Link to="/workouts" className="nav-btn">
          Workouts
        </Link>
        <Link to="/logs" className="nav-btn">
          Logs
        </Link>
        <Link to="/calendar" className="nav-btn">
          Calendar
        </Link>
        <Link to="/payments" className="nav-btn">
          Payments
        </Link>
      </div>

      <div className="right-btns">
        <div className="icon-btn">
          <Link to="/messages" className="circle">
            <img src={inboxIcon} alt="Messages icon" className="circle-icon" />
          </Link>

          <div className="nav-small">
            <Link to="/messages" className="nav-btn-small">
              Messages
            </Link>
          </div>
        </div>
        <div className="icon-btn profile-dropdown-wrapper">
          <div
            className="circle"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: "pointer" }}
          >
            {user?.profile_pic ? (
              <img
                src={user.profile_pic}
                alt="Profile"
                className="circle-icon"
                style={{
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <img src={userIcon} alt="Profile icon" className="circle-icon" />
            )}
          </div>

          <div className="nav-small">
            <span
              className="nav-btn-small"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: "pointer" }}
            >
              {user ? `${user.first_name} ${user.last_name}` : "Profile"}
            </span>
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                Profile Settings
              </Link>
              {user?.role === "coach" && (
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setActiveRole(activeRole === "coach" ? "client" : "coach");
                    setShowDropdown(false);
                  }}
                >
                  Switch to {activeRole === "coach" ? "Client" : "Coach"}
                </div>
              )}
              <div className="dropdown-item logout-item" onClick={handleLogout}>
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
