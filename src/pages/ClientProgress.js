import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/ClientProgress.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ClientProgress() {
  const { clientUserId } = useParams();

  const [client, setClient] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("workouts");

  const [graphData, setGraphData] = useState({
    workouts: [],
    calories: [],
    weight: [],
    energy: [],
    stress: [],
    motivation: [],
  });

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

        const workouts = workoutData.data || [];

        setClient(clientData);
        setWorkoutLogs(workouts);

        const workoutChartData = workouts.map((log) => ({
          day: new Date(log.date).toLocaleDateString(),
          value: 1,
        }));

        setGraphData((prev) => ({
          ...prev,
          workouts: workoutChartData,
        }));
      } catch (err) {
        console.error("Failed to load client progress:", err);
      }
    };

    fetchClientData();
  }, [clientUserId]);

  const graphOptions = {
    workouts: {
      title: "Workout Progress",
      data: graphData.workouts,
      label: "Workouts",
    },
    calories: {
      title: "Calories",
      data: graphData.calories,
      label: "Calories",
    },
    weight: {
      title: "Weight",
      data: graphData.weight,
      label: "Weight",
    },
    energy: {
      title: "Energy",
      data: graphData.energy,
      label: "Energy",
    },
    stress: {
      title: "Stress",
      data: graphData.stress,
      label: "Stress",
    },
    motivation: {
      title: "Motivation",
      data: graphData.motivation,
      label: "Motivation",
    },
  };

  const currentGraph = graphOptions[selectedMetric];

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
            <h2 className="client-card-title">{currentGraph.title}</h2>

            <div className="graph-tabs">
              <button
                type="button"
                className={selectedMetric === "workouts" ? "active" : ""}
                onClick={() => setSelectedMetric("workouts")}
              >
                Workouts
              </button>

              <button
                type="button"
                className={selectedMetric === "calories" ? "active" : ""}
                onClick={() => setSelectedMetric("calories")}
              >
                Calories
              </button>

              <button
                type="button"
                className={selectedMetric === "weight" ? "active" : ""}
                onClick={() => setSelectedMetric("weight")}
              >
                Weight
              </button>

              <button
                type="button"
                className={selectedMetric === "energy" ? "active" : ""}
                onClick={() => setSelectedMetric("energy")}
              >
                Energy
              </button>

              <button
                type="button"
                className={selectedMetric === "stress" ? "active" : ""}
                onClick={() => setSelectedMetric("stress")}
              >
                Stress
              </button>

              <button
                type="button"
                className={selectedMetric === "motivation" ? "active" : ""}
                onClick={() => setSelectedMetric("motivation")}
              >
                Motivation
              </button>
            </div>

            {currentGraph.data.length === 0 ? (
              <p className="empty-state">
                No {currentGraph.label.toLowerCase()} graph data yet.
              </p>
            ) : (
              <div className="client-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart
                    data={currentGraph.data}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.12)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#cfd6de", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fill: "#cfd6de", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#6ca6ff"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#6ca6ff",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
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
              Needs backend meal-log endpoint.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ClientProgress;