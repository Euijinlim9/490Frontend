import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/ClientProgress.css";

function ClientProgress() {
  const { clientUserId } = useParams();

  const [client, setClient] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchClientData = async () => {
      try {
        const clientRes = await fetch(
          `http://localhost:4000/api/coach/clients/${clientUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": "coach",
            },
          }
        );

        const workoutRes = await fetch(
          `http://localhost:4000/api/coach/clients/${clientUserId}/workouts/logs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": "coach",
            },
          }
        );

        const clientData = await clientRes.json();
        const workoutData = await workoutRes.json();

        setClient(clientData);
        setWorkoutLogs(workoutData.data || []);
      } catch (err) {
        console.error("Failed to load client progress:", err);
      }
    };

    fetchClientData();
  }, [clientUserId]);

  if (!client) {
    return <div className="client-progress-page">Loading...</div>;
  }

  return (
    <div className="client-progress-page">
      <div className="client-progress-container">
        <div className="client-progress-header">
          <h1 className="client-progress-title">
            {client.first_name} {client.last_name}
          </h1>
          <p className="client-progress-subtitle">
            View client progress, workouts, and logs.
          </p>
        </div>

        <div className="client-progress-grid">
          <section className="client-card">
            <h2 className="client-card-title">Client Progress</h2>

            <div className="client-stats">
              <div className="client-stat-box">
                <p className="client-stat-label">Goal</p>
                <p className="client-stat-value">
                  {client.profile?.goal || "No goal listed"}
                </p>
              </div>

              <div className="client-stat-box">
                <p className="client-stat-label">Current Activity</p>
                <p className="client-stat-value">
                  {client.profile?.current_activity || "N/A"}
                </p>
              </div>

              <div className="client-stat-box">
                <p className="client-stat-label">Weight</p>
                <p className="client-stat-value">
                  {client.profile?.weight || "N/A"}
                </p>
              </div>

              <div className="client-stat-box">
                <p className="client-stat-label">Goal Weight</p>
                <p className="client-stat-value">
                  {client.profile?.goal_weight || "N/A"}
                </p>
              </div>
            </div>
          </section>

          <section className="client-card">
            <h2 className="client-card-title">Workout Logs</h2>

            {workoutLogs.length === 0 ? (
              <p className="empty-state">No workout logs yet.</p>
            ) : (
              <div className="logs-list">
                {workoutLogs.map((log) => (
                  <div key={log.workout_log_id} className="log-card">
                    <p className="log-title">
                      {log.Workout?.title || "Workout"}
                    </p>
                    <p className="log-date">{log.date}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="client-card">
            <h2 className="client-card-title">Diet Logs</h2>
            <p className="empty-state">
              Needs backend meal-log endpoint or temporary localStorage setup.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ClientProgress;