import React from "react";
import "../styles/Logs.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Logs() {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Validate size (max 10MB raw, becomes ~13MB base64)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please pick one under 10MB.");
      return;
    }

    setUploading(true);
    try {
      // Read file as base64 data URL
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image_data: base64,
          taken_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      alert("Photo uploaded!");
      // Reset the input so user can re-upload the same file if needed
      e.target.value = "";
    } catch (err) {
      console.error("Photo upload error:", err);
      alert(err.message || "Could not upload photo. Try again.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="logs-page">
      <div className="logs-layout">
        <div className="logs-main">
          <div className="logs-header">
            <h1 className="logs-title">Tracking</h1>
            <p className="logs-subtitle">
              Choose what you want to log today and quickly jump to your recent
              activity.
            </p>
          </div>

          <div className="logs-home-grid">
            <div className="logs-home-card">
              <div className="logs-home-card-top">
                <h2>Log Meals</h2>
                <p>
                  Track calories, macros, meal timing, and nutrition details.
                </p>
              </div>
              <div className="logs-home-actions">
                <Link to="/log-meal" className="logs-home-button">
                  Go to Meal Log
                </Link>
                <Link to="/premade-meals" className="logs-home-button">
                  Pre-made Meals
                </Link>
              </div>
            </div>

            <div className="logs-home-card">
              <div className="logs-home-card-top">
                <h2>Log Wellness</h2>
                <p>Track sleep, water intake, daily steps, and heart rate.</p>
              </div>
              <Link to="/log-wellness" className="logs-home-button">
                Go to Wellness Log
              </Link>
            </div>

            <div className="logs-home-card">
              <div className="logs-home-card-top">
                <h2>Log Workouts</h2>
                <p>Start a workout or record completed workout activity.</p>
              </div>
              <Link to="/log-workout" className="logs-home-button">
                Go to Workout Log
              </Link>
            </div>
          </div>

          <div className="logs-preview-grid">
            <div className="logs-preview-card">
              <h3>Recent Meals</h3>
              <p>
                Review your latest meal entries and stay on top of your
                nutrition.
              </p>
              <Link to="/recent-meals" className="logs-preview-link">
                View Past Meals
              </Link>
            </div>

            <div className="logs-preview-card">
              <h3>Recent Workouts</h3>
              <p>
                Look back at completed workouts and keep your progress
                consistent.
              </p>
              <Link to="/recent-workouts" className="logs-preview-link">
                View Past Workouts
              </Link>
            </div>

            <div className="logs-preview-card logs-preview-wide">
              <div className="logs-preview-wide-inner">
                <div>
                  <h3>Workout Photos</h3>
                  <p>
                    Capture and review your workout progress photos over time.
                  </p>
                </div>
                <div className="logs-home-actions">
                  <label
                    className={`logs-home-button logs-photo-upload-btn ${
                      uploading ? "disabled" : ""
                    }`}
                  >
                    {uploading ? "Uploading..." : "Add a Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </label>
                  <Link to="/workout-photos" className="logs-home-button">
                    View Photos
                  </Link>
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
