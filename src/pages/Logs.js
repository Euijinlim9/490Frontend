import React from "react";
import "../styles/Logs.css"; 
import { Link } from "react-router-dom";

function Logs() {
  return (
    <div className="logs-page">
      <div className="logs-layout">
        <div className="logs-sidebar">
          <Link to="/dashboard" className="side-button">Dashboard</Link> 
          <Link to="/logs" className="side-button">Logs</Link>
          <Link to="/calendar" className="side-button">Calendar</Link>
          <Link to="/workouts" className="side-button">Workouts</Link>
          <Link to="/payments" className="side-button">Payments</Link>
        </div>

        <div className="logs-main">
          <div className="logs-grid">
            <div className="log-card">
              <div className="log-card-header">
                <div className="log-card-title">Track Your meals</div>
                <div className="log-card-subtitle">
                  Log your meals, including calorie intake and time.
                </div>
              </div> 

              <div className="log-form"> 
                <div className="form-group"> 
                  <label>Name of Meal</label>
                  <input
                    className="log-input"
                    type="text"
                    placeholder="Enter Meal Name"
                    />
                </div>

                <div className="form-group"> 
                  <label>Enter Calories</label>
                  <input
                    className="log-input"
                    type="number"
                    placeholder="Enter Calories"
                    />
                </div>

                <div className="form-row">
                <div className="form-group">
                  <label>Grams of Protein</label>
                    <input 
                      className="log-input"
                      type="number"
                      placeholder="Enter Grams of Protein"
                    />
                  </div>

                <div className="form-group">
                  <label>Grams of Fiber</label>
                    <input 
                      className="log-input"
                      type="number"
                      placeholder="Enter Grams of Fiber"
                    />
                  </div>
                  </div>

                  <div className="form-row">
                <div className="form-group">
                  <label>Grams of Carbs</label>
                    <input 
                      className="log-input"
                      type="number"
                      placeholder="Enter Grams of Carbs"
                    />
                  </div>

                <div className="form-group">
                  <label>Grams of Fats</label>
                    <input 
                      className="log-input"
                      type="number"
                      placeholder="Enter Grams of Fats"
                    />
                  </div>
                  </div>

                <div className="form-group"> 
                  <label>Time of Meal</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input type="radio" name="mealTime" /> Breakfast
                    </label>
                    <label className="radio-option">
                      <input type="radio" name="mealTime" /> Lunch
                    </label>
                    <label className="radio-option">
                      <input type="radio" name="mealTime" /> Dinner
                    </label>
                    <label className="radio-option">
                      <input type="radio" name="mealTime" /> Snack
                    </label>
                  </div>
                </div>

                <button className="log-button">Log Meal</button>
              </div>
            </div> 

            <div className="log-card">
              <div className="log-card-header">
                <div className="log-card-title">Log Your Workouts</div>
                <div className="log-card-subtitle">
                  Track your exercises, sets, reps, and duration.
                </div>
              </div>

              <div className="log-form">
                <div className="form-group">
                  <label>Workout Type</label>
                  <select className="log-select">
                    <option value="">Select Workout</option>
                    <option value="cardio">Cardio</option>
                    <option value="weight-training">Weight training</option>
                    <option value="low-impact">Low Impact</option>
                    <option value="mixed">Mixed</option>
                  </select> 
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sets</label>
                    <input 
                      className="log-input"
                      type="number"
                      placeholder="Enter sets"
                    />
                  </div>

                  <div className="form-group">
                    <label>Reps</label>
                    <input
                      className="log-input"
                      type="number"
                      placeholder="Enter reps"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Exercise Duration</label>
                    <input
                      className="log-input"
                      type="number"
                      placeholder="Enter minutes"
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input className="log-input" type="date" />
                  </div>
                </div>

                <button className="log-button">Log Workout</button>
              </div>
            </div>
          </div> 
        </div> 
      </div> 
    </div>
  ); 
}

export default Logs; 