import React from "react";
import "../styles/Logs.css";
import { Link } from "react-router-dom";

function Logs() {
  return (
    <div className="logs-page">
      <div className="logs-layout">
        <div className="logs-main">
          <div className="logs-header">
            <h1 className="logs-title">Tracking</h1>
            <p className="logs-subtitle">
              Choose what you want to log today and quickly jump to your recent activity.
            </p>
          </div>

          <div className="logs-home-grid">
            <div className="logs-home-card">
              <div className="logs-home-card-top">
                <h2>Log Meals</h2>
                <p>Track calories, macros, meal timing, and nutrition details.</p>
              </div>
              <div className="logs-home-actions">
                <Link to="/log-meal" className="logs-home-button">Go to Meal Log</Link>
                <Link to="/premade-meals" className="logs-home-button">Pre-made Meals</Link>
              </div>
            </div>

            <div className="logs-home-card">
              <div className="logs-home-card-top">
                <h2>Log Wellness</h2>
                <p>Track sleep, water intake, daily steps, and heart rate.</p>
              </div>
              <Link to="/log-wellness" className="logs-home-button">Go to Wellness Log</Link>
            </div>

            <div className="logs-home-card">
              <div className="logs-home-card-top">
                <h2>Log Workouts</h2>
                <p>Start a workout or record completed workout activity.</p>
              </div>
              <Link to="/log-workout" className="logs-home-button">Go to Workout Log</Link>
            </div>
          </div>

          <div className="logs-preview-grid">
            <div className="logs-preview-card">
              <h3>Recent Meals</h3>
              <p>Review your latest meal entries and stay on top of your nutrition.</p>
              <Link to="/recent-meals" className="logs-preview-link">View Past Meals</Link>
            </div>

            <div className="logs-preview-card">
              <h3>Recent Workouts</h3>
              <p>Look back at completed workouts and keep your progress consistent.</p>
              <Link to="/recent-workouts" className="logs-preview-link">View Past Workouts</Link>
            </div>

            <div className="logs-preview-card logs-preview-wide">
              <div className="logs-preview-wide-inner">
                <div>
                  <h3>Workout Photos</h3>
                  <p>Capture and review your workout progress photos over time.</p>
                </div>
                <div className="logs-home-actions">
                  <label className="logs-home-button logs-photo-upload-btn">
                    Add a Photo
                    <input type="file" accept="image/*" style={{ display: "none" }} />
                  </label>
                  <Link to="/workout-photos" className="logs-home-button">View Photos</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;
