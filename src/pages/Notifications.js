import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Notifications.css";

function Notifications() {
  const { user, activeRole } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const notificationKey =
      activeRole === "coach"
        ? `coachNotifications-${user.user_id}`
        : `clientNotifications-${user.user_id}`;

    const saved = JSON.parse(localStorage.getItem(notificationKey)) || [];

    const updatedNotifications = saved.map((notif) => ({
      ...notif,
      read: true,
    }));

    setNotifications(updatedNotifications);

    localStorage.setItem(
      notificationKey,
      JSON.stringify(updatedNotifications)
    );
  }, [user, activeRole]);

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <h1 className="notifications-title">Notifications</h1>

        <p className="notifications-subtitle">
          Stay updated on requests and account activity.
        </p>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <h3>No notifications yet</h3>
            <p>You’ll see alerts and updates here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif, index) => (
              <div key={index} className="notification-card">
                <div className="notification-left">
                  <p className="notification-message">
                    {notif.message}
                  </p>

                  <span className="notification-date">
                    {notif.date}
                  </span>
                </div>

                {!notif.read && (
                  <div className="notification-dot"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;