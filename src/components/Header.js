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

    let cancelled = false;

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:4000/api/notifications/unread-count?for_role=${activeRole}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled)
          setNotifications(Array(data.count).fill({ read: false }));
      } catch (err) {
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
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

        {activeRole === "admin" && (
          <>
            <Link to="/admin/coachapp" className="nav-btn">
              Applications
            </Link>
            <Link to="/admin/viewusers" className="nav-btn">
              View All Accounts
            </Link>
            <Link to="/admin/exercise" className="nav-btn">
              Exercises
            </Link>
            <Link to="/admin/userreport" className="nav-btn">
              User Reports
            </Link>
          </>
        )}

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
        {activeRole === "nutritionist" && (
          <>
            <Link to="/nutritionist/plans" className="nav-btn">
              Meal Plans
            </Link>
            <Link to="/nutritionist/requests" className="nav-btn">
              Requests
            </Link>
            <Link to="/nutritionist/profile" className="nav-btn">
              My Profile
            </Link>
          </>
        )}
      </div>

      <div className="right-btns">
        {(activeRole === "coach" || activeRole === "client") && (
          <div className="icon-btn">
            <Link
              to="/notifications"
              className="circle notif-circle"
              aria-label="Alerts"
              title="Alerts"
            >
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
          </div>
        )}

        <div className="icon-btn">
          <Link
            to="/messages"
            className="circle"
            aria-label="Messages"
            title="Messages"
          >
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
        </div>

        <div className="icon-btn profile-dropdown-wrapper">
          <button
            type="button"
            className="circle"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Profile menu"
            aria-expanded={showDropdown}
            title="Profile"
          >
            {user?.profile_pic ? (
              <img
                src={
                  user.profile_pic.startsWith("http") ? user.profile_pic:
                  `http://localhost:4000${user.profile_pic}`
                }
                alt="Profile"
                className="circle-icon profile"
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
          </button>

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
