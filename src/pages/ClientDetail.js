import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ClientDetail.css";
import NotesTab from "../components/NotesTab";
import WorkoutsTab from "../components/WorkoutsTab";

function ClientDetail() {
  const { clientUserId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:4000/api/coach/clients/${clientUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": "coach",
            },
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load client");
        }

        const data = await res.json();
        setClient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientUserId]);

  if (loading) return <div className="cd-state">Loading client details…</div>;
  if (error) return <div className="cd-state cd-error">Error: {error}</div>;
  if (!client) return <div className="cd-state">Client not found</div>;

  const profile = client.profile || {};

  return (
    <div className="cd-page">
      {/* Breadcrumb */}
      <div className="cd-breadcrumb">
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        <span className="cd-breadcrumb-sep">/</span>
        <span>Clients</span>
        <span className="cd-breadcrumb-sep">/</span>
        <span className="cd-breadcrumb-current">
          {client.first_name} {client.last_name}
        </span>
      </div>

      {/* Header */}
      <div className="cd-header">
        <div className="cd-header-left">
          <img
            src={client.profile_pic || "/default-avatar.png"}
            alt={client.first_name}
            className="cd-avatar"
          />
          <div className="cd-identity">
            <h1>
              {client.first_name} {client.last_name}
            </h1>
            <div className="cd-meta-row">
              <span className="cd-status-dot active" />
              <span className="cd-meta">Active client</span>
              <span className="cd-meta-divider">·</span>
              <span className="cd-meta">
                Since{" "}
                {client.relationship?.start_date
                  ? new Date(
                      client.relationship.start_date
                    ).toLocaleDateString()
                  : "recently"}
              </span>
              {client.email && (
                <>
                  <span className="cd-meta-divider">·</span>
                  <span className="cd-meta">{client.email}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="cd-header-actions">
          <button className="cd-btn cd-btn-secondary">Message</button>
          <button className="cd-btn cd-btn-danger">Drop Client</button>
        </div>
      </div>

      {/* Stat row */}
      <div className="cd-stats">
        <div className="cd-stat">
          <div className="cd-stat-value">{profile.goal || "—"}</div>
          <div className="cd-stat-label">Goal</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-value">{profile.current_activity || "—"}</div>
          <div className="cd-stat-label">Activity Level</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-value">
            {profile.workout_day ? `${profile.workout_day}/wk` : "—"}
          </div>
          <div className="cd-stat-label">Frequency</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-value">
            {profile.weight && profile.goal_weight
              ? `${profile.weight} → ${profile.goal_weight}`
              : "—"}
          </div>
          <div className="cd-stat-label">Weight (lbs)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="cd-tabs">
        <button
          className={`cd-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`cd-tab ${activeTab === "workouts" ? "active" : ""}`}
          onClick={() => setActiveTab("workouts")}
        >
          Workouts
        </button>
        <button
          className={`cd-tab ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>
      </div>

      {/* Tab content */}
      <div className="cd-content">
        {activeTab === "overview" && <OverviewTab profile={profile} />}
        {activeTab === "workouts" && (
          <WorkoutsTab clientUserId={clientUserId} />
        )}

        {activeTab === "notes" && <NotesTab clientUserId={clientUserId} />}
      </div>
    </div>
  );
}

// Overview tab — three info cards
function OverviewTab({ profile }) {
  const fmt = (val, suffix = "") => (val ? `${val}${suffix}` : "—");

  return (
    <div className="cd-overview">
      <div className="cd-card">
        <div className="cd-card-header">Body Stats</div>
        <div className="cd-card-body">
          <Row label="Height" value={fmt(profile.height, " in")} />
          <Row label="Current Weight" value={fmt(profile.weight, " lbs")} />
          <Row label="Goal Weight" value={fmt(profile.goal_weight, " lbs")} />
        </div>
      </div>

      <div className="cd-card">
        <div className="cd-card-header">Goals & Training</div>
        <div className="cd-card-body">
          <Row label="Primary Goal" value={fmt(profile.goal)} />
          <Row label="Workout Type" value={fmt(profile.type_workout)} />
          <Row label="Activity Level" value={fmt(profile.current_activity)} />
          <Row label="Days/Week" value={fmt(profile.workout_day)} />
        </div>
      </div>

      <div className="cd-card">
        <div className="cd-card-header">Preferences</div>
        <div className="cd-card-body">
          <Row label="Diet Preference" value={fmt(profile.diet_preference)} />
          <Row label="Wants Coach" value={profile.coach_help ? "Yes" : "No"} />
          <Row
            label="Wants Nutritionist"
            value={profile.nutritionist_help ? "Yes" : "No"}
          />
          <Row
            label="Survey Complete"
            value={profile.survey_completed ? "Yes" : "Incomplete"}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="cd-row">
      <span className="cd-row-label">{label}</span>
      <span className="cd-row-value">{value}</span>
    </div>
  );
}

export default ClientDetail;
