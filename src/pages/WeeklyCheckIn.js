import React, { useState, useContext } from "react";
import "../styles/CheckIn.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function WeeklyCheckIn() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    weight: "",
    energy: 5,
    stress: 5,
    mood: "",
    nextGoal: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!user) return;

  const today = new Date();
  const thisWeek = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const savedCheckins =
    JSON.parse(localStorage.getItem("weeklyCheckins")) || [];

  const newCheckin = {
    ...formData,
    userId: user.user_id,
    date: today.toLocaleDateString(),
    weekKey: thisWeek,
  };

  localStorage.setItem(
    "weeklyCheckins",
    JSON.stringify([...savedCheckins, newCheckin])
  );

  const savedSurvey = JSON.parse(localStorage.getItem("clientSurveyData"));

  if (savedSurvey && formData.weight) {
    const newWeight = Number(formData.weight);
    const weightKg = newWeight * 0.453592;

    const bmr =
      savedSurvey.gender === "male"
        ? 10 * weightKg + 6.25 * savedSurvey.heightCm - 5 * savedSurvey.age + 5
        : 10 * weightKg + 6.25 * savedSurvey.heightCm - 5 * savedSurvey.age - 161;

    const tdee = bmr * savedSurvey.activityFactor;

    const changeMap = {
      0.5: 250,
      1: 500,
      1.5: 750,
    };

    const adjustment = changeMap[savedSurvey.weeklyChange] || 0;

    let calorieTarget = tdee;

    if (savedSurvey.goal === "lose") {
      calorieTarget = tdee - adjustment;
    } else if (savedSurvey.goal === "gain") {
      calorieTarget = tdee + adjustment;
    }

    const updatedSurvey = {
      ...savedSurvey,
      currentWeight: newWeight,
      weightKg,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieTarget: Math.round(calorieTarget),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("clientSurveyData", JSON.stringify(updatedSurvey));
  }

  localStorage.setItem(`lastWeeklyCheckin-${user.user_id}`, thisWeek);

  alert("Weekly check-in saved!");
  navigate("/dashboard");
};

  if (!user) return null;

  return (
    <div className="weekly-page">
      <div className="weekly-card">
        <h1>Weekly Check-in</h1>
        <p>Reflect on your week and track your progress.</p>

        <form onSubmit={handleSubmit} className="weekly-form">
          <div className="weekly-group">
            <label>Weekly Weight</label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Enter Weight"
            />
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
            <label>Mood</label>
            <select name="mood" value={formData.mood} onChange={handleChange}>
              <option value="">Select Mood</option>
              <option value="great">Great</option>
              <option value="good">Good</option>
              <option value="okay">Okay</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="weekly-group">
            <label>Goal for Next Week</label>
            <textarea
              name="nextGoal"
              value={formData.nextGoal}
              onChange={handleChange}
              placeholder="What do you want to improve next week?"
            />
          </div>

          <button type="submit" className="weekly-submit">
            Submit Weekly Check-In
          </button>
        </form>
      </div>
    </div>
  );
}

export default WeeklyCheckIn;