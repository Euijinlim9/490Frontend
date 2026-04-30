import React, { useState } from "react";
import "../styles/Survey.css";

function CoachSurvey({ show, onClose }) {
  const [form, setForm] = useState({
    workoutType: "",
    clientLevel: "",
    coachingStyle: "",
    preferredGoals: "",
    availabilityDay: [],
    limitations: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvailabilityChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      availabilityDay: e.target.checked
        ? [...prev.availabilityDay, value]
        : prev.availabilityDay.filter((day) => day !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Coach survey submitted!", form);

    // backend will go here later

    onClose();
  };

  if (!show) return null;

  return (
    <div className="survey-overlay">
      <div className="survey-box">
        <h2>Initial Survey</h2>

        <form onSubmit={handleSubmit} className="survey-form">
          <select
            name="workoutType"
            value={form.workoutType}
            onChange={handleChange}
          >
            <option value="">Type of Workout</option>
            <option value="strength-training">Strength Training</option>
            <option value="cardio">Cardio</option>
            <option value="low-impact">Low Impact</option>
            <option value="mixed">Mixed</option>
          </select>

          <select
            name="clientLevel"
            value={form.clientLevel}
            onChange={handleChange}
          >
            <option value="">Preferred Client Level For Activity</option>
            <option value="none">No Preference</option>
            <option value="beginner">Beginner</option>
            <option value="moderate">Moderate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            name="coachingStyle"
            value={form.coachingStyle}
            onChange={handleChange}
          >
            <option value="">Coaching Style That Matches You Best</option>
            <option value="strict">Strict</option>
            <option value="flexible">Flexible</option>
            <option value="hands-on">Hands-On</option>
            <option value="hands-off">Hands-Off</option>
          </select>

          <select
            name="preferredGoals"
            value={form.preferredGoals}
            onChange={handleChange}
          >
            <option value="">Preferred Client Goal</option>
            <option value="muscle-gain">Muscle Gain</option>
            <option value="fat-loss">Fat Loss</option>
            <option value="consistency">Consistency</option>
          </select>

          <div className="availability-days">
            <p className="availability-title">Available Days</p>

            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => {
              const value = day.toLowerCase();

              return (
                <label className="availability-option" key={day}>
                  <input
                    type="checkbox"
                    value={value}
                    checked={form.availabilityDay.includes(value)}
                    onChange={handleAvailabilityChange}
                  />
                  <span>{day}</span>
                </label>
              );
            })}
          </div>

          <select
            name="limitations"
            value={form.limitations}
            onChange={handleChange}
          >
            <option value="">Limitations of Your Coaching</option>
            <option value="post-injury">No Clients Post-Injury</option>
            <option value="advanced-lifting">
              No Clients in Advanced Powerlifting
            </option>
            <option value="male-oriented">Only Male Clients</option>
            <option value="female-oriented">Only Female Clients</option>
            <option value="older-50">No Clients Over 50</option>
            <option value="younger-50">No Clients Younger Than 50</option>
            <option value="extreme-cardio">
              No Extreme Cardio Clients
            </option>
          </select>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default CoachSurvey;
