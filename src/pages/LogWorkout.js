import "../styles/Logs.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function LogWorkout() {
  const navigate = useNavigate();
  const [workoutForm, setWorkoutForm] = useState({
    incline: "",
    distance: "",
    speed: "",
    time: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkoutForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkoutSubmit = (e) => {
    e.preventDefault();

    const savedWorkouts =
      JSON.parse(localStorage.getItem("loggedWorkouts")) || [];

    const newWorkout = {
      ...workoutForm,
      date: new Date().toLocaleDateString(),
    };

    localStorage.setItem(
      "loggedWorkouts",
      JSON.stringify([...savedWorkouts, newWorkout])
    );

    setWorkoutForm({
      incline: "",
      distance: "",
      speed: "",
      time: "",
    });
    navigate("/dashboard"); 
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <div className="form-title">Log Your Workouts</div>
          <div className="form-subtitle">
            Start a workout from the workouts page or log cardio details here.
          </div>
        </div>

        <div className="form-actions-top">
          <Link to="/workouts" className="form-button secondary-button">
            Go to Workouts
          </Link>
        </div>

        <form className="form-body" onSubmit={handleWorkoutSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Incline</label>
              <input
                className="log-input"
                type="number"
                name="incline"
                value={workoutForm.incline}
                onChange={handleChange}
                placeholder="Cardio Incline"
              />
            </div>

            <div className="form-group">
              <label>Speed (mph)</label>
              <input
                className="log-input"
                type="number"
                name="speed"
                value={workoutForm.speed}
                onChange={handleChange}
                placeholder="Cardio Speed"
              />
            </div>

            <div className="form-group">
              <label>Distance (mi)</label>
              <input
                className="log-input"
                type="number"
                name="distance"
                value={workoutForm.distance}
                onChange={handleChange}
                placeholder="Cardio Distance"
              />
            </div>
            <div className="form-group">
              <label>Time (min)</label>
              <input
                className="log-input"
                type="number"
                name="time"
                value={workoutForm.time}
                onChange={handleChange}
                placeholder="Cardio Workout Time"
              />
            </div>
          </div>

          <button type="submit" className="form-button">
            Log Workout
          </button>
        </form>
      </div>
    </div>
  );
}

export default LogWorkout;