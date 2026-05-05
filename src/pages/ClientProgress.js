import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import AssignWorkoutModal from "../components/AssignWorkoutModal";
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
  const [lightboxPhoto, setLightboxPhoto] = useState(null); // lightbox for client progress photos

  const [graphData, setGraphData] = useState({
    workouts: [],
    calories: [],
    weight: [],
    energy: [],
    stress: [],
    motivation: [],
  });
  const [assignedWorkouts, setAssignedWorkouts] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [photoPage, setPhotoPage] = useState(1);
  const [photoTotalPages, setPhotoTotalPages] = useState(1);
  const [photoFilter, setPhotoFilter] = useState({ from: "", to: "" });
  const [photoLoading, setPhotoLoading] = useState(false);
  const PHOTOS_PER_PAGE = 8;
  const applyDatePreset = (preset) => {
    const today = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];

    if (preset === "all") {
      setPhotoFilter({ from: "", to: "" });
    } else if (preset === "7d") {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      setPhotoFilter({ from: fmt(d), to: fmt(today) });
    } else if (preset === "30d") {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      setPhotoFilter({ from: fmt(d), to: fmt(today) });
    } else if (preset === "90d") {
      const d = new Date();
      d.setDate(today.getDate() - 90);
      setPhotoFilter({ from: fmt(d), to: fmt(today) });
    }
    setPhotoPage(1);
  };

  const fetchClientData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "X-Active-Role": "coach",
    };

    try {
      const [clientRes, workoutRes, assignedRes] = await Promise.all([
        fetch(`http://localhost:4000/api/coach/clients/${clientUserId}`, {
          headers,
        }),
        fetch(
          `http://localhost:4000/api/coach/clients/${clientUserId}/workouts/logs`,
          { headers }
        ),
        fetch(
          `http://localhost:4000/api/coach/clients/${clientUserId}/workouts/assigned`,
          { headers }
        ),
      ]);

      const clientData = await clientRes.json();
      if (!clientRes.ok) throw new Error("Failed to load client");
      const workoutData = await workoutRes.json();
      const assignedData = assignedRes.ok
        ? await assignedRes.json()
        : { data: [] };

      const workouts = workoutData.data || [];
      const assignments = assignedData.data || [];

      setClient(clientData);
      setWorkoutLogs(workouts);
      setAssignedWorkouts(assignments);

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
  }, [clientUserId]);

  const fetchPhotos = useCallback(async () => {
    setPhotoLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: photoPage,
        limit: PHOTOS_PER_PAGE,
      });
      if (photoFilter.from) params.set("from_date", photoFilter.from);
      if (photoFilter.to) params.set("to_date", photoFilter.to);

      const res = await fetch(
        `http://localhost:4000/api/coach/clients/${clientUserId}/photos?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": "coach",
          },
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProgressPhotos(data.data || []);
      setPhotoTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load photos:", err);
      setProgressPhotos([]);
    } finally {
      setPhotoLoading(false);
    }
  }, [clientUserId, photoPage, photoFilter]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);
  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

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
  const handleUnassign = async (assignmentId) => {
    if (!window.confirm("Remove this assignment?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/assignments/${assignmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": "coach",
          },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove assignment");
      }
      setAssignedWorkouts((prev) =>
        prev.filter((a) => a.assigned_workout_id !== assignmentId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

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
            <div className="client-card-header-row">
              <h2 className="client-card-title">Assigned Workouts</h2>
              <button
                type="button"
                className="cp-btn cp-btn-primary"
                onClick={() => setShowAssignModal(true)}
              >
                + Assign Workout
              </button>
            </div>

            {assignedWorkouts.length === 0 ? (
              <p className="empty-state">
                No workouts assigned yet. Click "Assign Workout" to get started.
              </p>
            ) : (
              <div className="logs-list">
                {assignedWorkouts.map((a) => {
                  const workout = a.Workout || {};
                  return (
                    <div
                      key={a.assigned_workout_id}
                      className="log-card cp-assigned-card"
                    >
                      <div className="cp-assigned-info">
                        <p className="log-title">
                          {workout.title || "Workout"}
                          <span
                            className={`cp-status-badge cp-status-${a.status}`}
                          >
                            {a.status}
                          </span>
                        </p>
                        <p className="log-date">
                          {a.due_date
                            ? `Due ${new Date(a.due_date).toLocaleDateString()}`
                            : "No due date"}
                          {a.assigned_at &&
                            ` · Assigned ${new Date(
                              a.assigned_at
                            ).toLocaleDateString()}`}
                        </p>
                        {a.coach_notes && (
                          <p className="cp-assigned-notes">{a.coach_notes}</p>
                        )}
                      </div>
                      {a.status === "assigned" && (
                        <button
                          type="button"
                          className="cp-btn cp-btn-ghost"
                          onClick={() => handleUnassign(a.assigned_workout_id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
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
            <div className="cp-photos-header">
              <h2 className="client-card-title">Progress Photos</h2>
              <div className="cp-photos-filter">
                <button
                  className={`cp-filter-pill ${
                    !photoFilter.from && !photoFilter.to ? "active" : ""
                  }`}
                  onClick={() => applyDatePreset("all")}
                >
                  All
                </button>
                <button
                  className="cp-filter-pill"
                  onClick={() => applyDatePreset("7d")}
                >
                  Last 7 days
                </button>
                <button
                  className="cp-filter-pill"
                  onClick={() => applyDatePreset("30d")}
                >
                  Last 30 days
                </button>
                <button
                  className="cp-filter-pill"
                  onClick={() => applyDatePreset("90d")}
                >
                  Last 90 days
                </button>
              </div>
            </div>

            <div className="cp-photos-date-range">
              <label>
                From
                <input
                  type="date"
                  value={photoFilter.from}
                  onChange={(e) => {
                    setPhotoFilter((f) => ({ ...f, from: e.target.value }));
                    setPhotoPage(1);
                  }}
                  className="cp-date-input"
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={photoFilter.to}
                  onChange={(e) => {
                    setPhotoFilter((f) => ({ ...f, to: e.target.value }));
                    setPhotoPage(1);
                  }}
                  className="cp-date-input"
                />
              </label>
            </div>

            {photoLoading ? (
              <p className="empty-state">Loading photos…</p>
            ) : progressPhotos.length === 0 ? (
              <p className="empty-state">
                {photoFilter.from || photoFilter.to
                  ? "No photos in this date range."
                  : "No photos uploaded yet."}
              </p>
            ) : (
              <>
                <div className="cp-photo-grid">
                  {progressPhotos.map((photo) => (
                    <div
                      key={photo.photo_id}
                      className="cp-photo-card"
                      onClick={() => setLightboxPhoto(photo)}
                    >
                      <img
                        src={photo.image_data}
                        alt={photo.caption || "Progress"}
                        className="cp-photo-image"
                        loading="lazy"
                      />
                      <div className="cp-photo-date">
                        {photo.taken_date
                          ? new Date(photo.taken_date).toLocaleDateString()
                          : new Date(photo.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>

                {photoTotalPages > 1 && (
                  <div className="cp-pagination">
                    <button
                      className="cp-page-btn"
                      onClick={() => setPhotoPage((p) => Math.max(1, p - 1))}
                      disabled={photoPage === 1}
                    >
                      ← Prev
                    </button>
                    <span className="cp-page-info">
                      Page {photoPage} of {photoTotalPages}
                    </span>
                    <button
                      className="cp-page-btn"
                      onClick={() =>
                        setPhotoPage((p) => Math.min(photoTotalPages, p + 1))
                      }
                      disabled={photoPage === photoTotalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="client-card">
            <h2 className="client-card-title">Diet Logs</h2>
            <p className="empty-state">Needs backend meal-log endpoint.</p>
          </section>
        </div>
      </div>
      {showAssignModal && (
        <AssignWorkoutModal
          clientUserId={clientUserId}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            setShowAssignModal(false);
            fetchClientData();
          }}
        />
      )}
      {lightboxPhoto && (
        <div
          className="cp-lightbox-overlay"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            className="cp-lightbox-close"
            onClick={() => setLightboxPhoto(null)}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={lightboxPhoto.image_data}
            alt={lightboxPhoto.caption || "Progress"}
            className="cp-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="cp-lightbox-meta"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxPhoto.taken_date
              ? new Date(lightboxPhoto.taken_date).toLocaleDateString()
              : new Date(lightboxPhoto.created_at).toLocaleDateString()}
            {lightboxPhoto.caption && <span> · {lightboxPhoto.caption}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientProgress;
