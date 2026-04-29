import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Notifications.css";

function Notifications() {
  const { user, activeRole } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:4000/api/notifications?for_role=${activeRole}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setNotifications(data.notifications || []);

        // Mark all as read AFTER rendering so user still sees the dots this visit
        fetch(
          `http://localhost:4000/api/notifications/read-all?for_role=${activeRole}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch(() => {});
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, activeRole]);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <h1 className="notifications-title">Notifications</h1>
        <p className="notifications-subtitle">
          Stay updated on requests and account activity.
        </p>

        {loading ? (
          <div className="notifications-empty">
            <h3>Loading…</h3>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <h3>No notifications yet</h3>
            <p>You'll see alerts and updates here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => {
              const card = (
                <div key={notif.notification_id} className="notification-card">
                  <div className="notification-left">
                    <p className="notification-message">
                      {notif.body || notif.title}
                    </p>
                    <span className="notification-date">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  {!notif.is_read && <div className="notification-dot"></div>}
                </div>
              );

              return notif.link ? (
                <Link
                  key={notif.notification_id}
                  to={notif.link}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {card}
                </Link>
              ) : (
                card
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
