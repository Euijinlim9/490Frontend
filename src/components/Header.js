import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Header.css";

function Header() {
  const { user, logout, activeRole, setActiveRole } = useContext(AuthContext);

  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!user) return;

    const notificationKey =
      activeRole === "coach"
        ? `coachNotifications-${user.user_id}`
        : `clientNotifications-${user.user_id}`;

    const saved = JSON.parse(localStorage.getItem(notificationKey)) || [];

    setNotifications(saved);
  }, [user, activeRole]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="header">
      <Link to="/" className="logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="10" width="24" height="8" rx="4" fill="#4a9eff" />
          <rect x="6" y="4" width="4" height="20" rx="2" fill="#4a9eff" />
          <rect x="18" y="4" width="4" height="20" rx="2" fill="#4a9eff" />
        </svg>
        <span>FitnessFR</span>
      </Link>

      <div className="nav-pill">
        <Link to="/dashboard" className="nav-btn">
          Dashboard
        </Link>

        {activeRole === "client" && (
          <>
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
          </>
        )}
        {activeRole === "coach" && (
          <>
            <Link to="/workouts" className="nav-btn">
              Workouts
            </Link>
            <Link to="/coach/plans" className="nav-btn">
              Plans
            </Link>
            <Link to="/calendar" className="nav-btn">
              Schedule
            </Link>
          </>
        )}
      </div>

      <div className="right-btns">
        {(activeRole === "coach" || activeRole === "client") && (
          <div className="icon-btn">
            <Link to="/notifications" className="circle notif-circle">
              <svg viewBox="0 0 24 24" className="circle-icon">
                <path
                  d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22z"
                  fill="currentColor"
                />

                <path
                  d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>

              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </Link>

            <div className="nav-small">
              <Link to="/notifications" className="nav-btn-small">
                Alerts
              </Link>
            </div>
          </div>
        )}

        <div className="icon-btn">
          <Link to="/messages" className="circle">
            <svg viewBox="0 0 24 24" className="circle-icon">
              <path
                d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 8l7 5 7-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
              <svg viewBox="0 0 24 24" className="circle-icon">
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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
