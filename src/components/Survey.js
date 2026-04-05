import React, { useState } from "react";
import "../styles/Survey.css";

function Survey({ show, onClose }) {
  const [form, setForm] = useState({
    goal: "",
    typeWorkout: "",
    dietPreference: "",
    currentActivity: "",
    coachHelp: "",
    nutritionistHelp: "",
    workoutDay: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/survey/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Survey submitted! Redirecting...");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.error || "Failed to submit survey");
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  if (!show) return null;

  return (
    <div className="survey-overlay">
      <div className="survey-box">
        <h2>Initial Survey</h2>
        {message && <p className="survey-message">{message}</p>}
        <form onSubmit={handleSubmit} className="survey-form">
          <select name="goal" value={form.goal} onChange={handleChange}>
            <option value="">Select Your Goal</option>
            <option value="lose">Lose Weight</option>
            <option value="gain">Gain Weight</option>
            <option value="maintain">Maintain</option>
          </select>

          <select
            name="typeWorkout"
            value={form.typeWorkout}
            onChange={handleChange}
          >
            <option value="">Select Type of Workout</option>
            <option value="strength-training">Strength Training</option>
            <option value="cardio">Cardio</option>
            <option value="low-impact">Low Impact</option>
            <option value="mixed">Mixed</option>
          </select>

          <select
            name="dietPreference"
            value={form.dietPreference}
            onChange={handleChange}
          >
            <option value="">Select Diet Preferences</option>
            <option value="none">None</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="gluten-free">Gluten Free</option>
            <option value="vegan">Vegan</option>
          </select>

          <select
            name="currentActivity"
            value={form.currentActivity}
            onChange={handleChange}
          >
            <option value="">Select Activity Level</option>
            <option value="beginner">Beginner</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="none">No Activity</option>
          </select>

          <select
            name="coachHelp"
            value={form.coachHelp}
            onChange={handleChange}
          >
            <option value="">Select Coaching Option</option>
            <option value="workout-plans">Workout Plans</option>
            <option value="no-help">No Coach</option>
          </select>

          <select
            name="nutritionistHelp"
            value={form.nutritionistHelp}
            onChange={handleChange}
          >
            <option value="">Select Nutritionist Option</option>
            <option value="meal-plans">Meal Plans</option>
            <option value="calorie-tracking">Calorie Tracking</option>
            <option value="diet-guidance">Diet Guidance</option>
            <option value="no-help">No Nutritionist</option>
          </select>

          <select
            name="workoutDay"
            value={form.workoutDay}
            onChange={handleChange}
          >
            <option value="">Select Days</option>
            <option value="1">1 day</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="6">6 days</option>
          </select>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Survey;
