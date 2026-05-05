import React, { useState, useContext } from "react";
import "../styles/CheckIn.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function DailyCheckIns() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    mood: "",
    energy: 5,
    stress: 5,
    sleep: "",
    body: "",
    motivation: 5,
  }); 

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;


   const payload = {
    mood_level: formData.mood,
    energy_level: formData.energy,
    stress_level: formData.stress,
    sleep_quality: formData.sleep,
    body_quality: formData.body,
    motivation_level: formData.motivation,
  };

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:4000/api/logs/checkins/daily", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed check-in");

    alert("Saved!");
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
  };

  if (!user) return null;

  return (
    <div className="weekly-page">
      <div className="weekly-card">
        <h1>Daily Check-in</h1>
        <p>Track your progress for the day.</p>

        <form onSubmit={handleSubmit} className="weekly-form">
          <div className="weekly-group">
            <label>Mood Today</label>
            <select name="mood" value={formData.mood} onChange={handleChange}>
              <option value="">Select Mood</option>
              <option value="5">Great</option>
              <option value="4">Good</option>
              <option value="3">Okay</option>
              <option value="2">Low</option>
              <option value="1">Exhausted</option>
            </select>
          </div>

          <div className="weekly-group">
            <label>Energy Level (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              name="energy"
              value={formData.energy}
              onChange={handleChange}
            />
            <span>{formData.energy}</span>
          </div>

          <div className="weekly-group">
            <label>Stress Level (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              name="stress"
              value={formData.stress}
              onChange={handleChange}
            />
            <span>{formData.stress}</span>
          </div>

          <div className="weekly-group">
            <label>Sleep Quality</label>
            <select name="sleep" value={formData.sleep} onChange={handleChange}>
              <option value="">Select Quality</option>
              <option value="4">Excellent</option>
              <option value="3">Good</option>
              <option value="2">Okay</option>
              <option value="1">Poor</option>
            </select>
          </div>

          <div className="weekly-group">
            <label>Body Feels</label>
            <select name="body" value={formData.body} onChange={handleChange}>
              <option value="">Select Feeling</option>
              <option value="fresh">Fresh</option>
              <option value="sore">Sore</option>
              <option value="tight">Tight</option>
              <option value="recovered">Recovered</option>
            </select>
          </div>

          <div className="weekly-group">
            <label>Motivation Level (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
            />
            <span>{formData.motivation}</span>
          </div>

          <button type="submit" className="weekly-submit">
            Submit Daily Check-In
          </button>
        </form>
      </div>
    </div>
  );
}

export default DailyCheckIns;