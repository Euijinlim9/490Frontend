import React, { useState } from "react";
import "../styles/Logs.css"; 
import { Link, useNavigate } from "react-router-dom";

function Logs() {
  const navigate = useNavigate(); 

  const [mealForm, setMealForm] = useState({
    mealName: "",
    calories: "", 
    protein: "", 
    fiber: "", 
    carbs: "", 
    fats: "", 
    mealTime: "", 
  }); 

  const [workoutForm, setWorkoutForm] = useState({
    workoutType: "",
    sets: "", 
    reps: "", 
    duration: "", 
    date: "",  
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMealForm((prev) => ({
      ...prev,
      [name]: value, 
    })); 
  }; 

  const handleWorkoutChange = (e) => {
    const { name, value } = e.target;
    setWorkoutForm((prev) => ({
      ...prev,
      [name]: value, 
    })); 
  };

  const handleMealSubmit = (e) => {
    e.preventDefault(); 

    const newMeal = {
      mealName: mealForm.mealName, 
      calories: Number(mealForm.calories) || 0,
      protein: Number(mealForm.protein) || 0,
      fiber: Number(mealForm.fiber) || 0,
      carbs: Number(mealForm.carbs) || 0, 
      fats: Number(mealForm.fats) || 0, 
      mealTime: mealForm.mealTime, 
      date: new Date().toLocaleDateString(), 
    };

    const existingMeals = JSON.parse(localStorage.getItem("loggedMeals")) || []; 

    const updatedMeals = [...existingMeals, newMeal]; 

    localStorage.setItem("loggedMeals", JSON.stringify(updatedMeals)); 

    setMealForm({
      mealName: "", 
      calories: "",
      protein: "", 
      fiber: "", 
      carbs: "", 
      fats: "", 
      mealTime: "",
    }); 

    navigate("/dashboard"); 
  }; 

  const handleWorkoutSubmit = (e) => {
    e.preventDefault();

  const newWorkout = {
      workoutType: workoutForm.workoutType, 
      sets: Number(workoutForm.sets) || 0,
      reps: Number(workoutForm.repss) || 0,
      duration: Number(workoutForm.duration) || 0,
      date: Number(workoutForm.date) || new Date().toLocaleDateString(), 
    };

    const existingWorkouts = JSON.parse(localStorage.getItem("loggedWorkouts")) || []; 

    const updatedWorkouts = [...existingWorkouts, newWorkout]; 

    localStorage.setItem("loggedWorkouts", JSON.stringify(updatedWorkouts)); 

    setWorkoutForm({
      workoutType: "", 
      sets: "",
      reps: "", 
      duration: "", 
      date: "", 
    }); 

    navigate("/dashboard"); 
  }; 

  return (
    <div className="logs-page">
      <div className="logs-layout">
        <div className="logs-sidebar">
          <Link to="/dashboard" className="side-button">Dashboard</Link> 
          <Link to="/logs" className="side-button">Logs</Link>
          <Link to="/calendar" className="side-button">Calendar</Link>
          <Link to="/workouts" className="side-button">Workouts</Link>
          <Link to="/payments" className="side-button">Payments</Link>
          <Link to="/recent-meals" className="side-button">Recent Meals</Link>
          <Link to="/recent-workouts" className="side-button">Recent Workouts</Link>

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

              <form className="log-form" onSubmit={handleMealSubmit}> 
                <div className="form-group"> 
                  <label>Name of Meal</label>
                  <input
                    className="log-input"
                    type="text"
                    name="mealName"
                    value={mealForm.mealName}
                    onChange={handleChange}
                    placeholder="Enter Meal Name"
                    />
                </div>

                <div className="form-group"> 
                  <label>Enter Calories</label>
                  <input
                    className="log-input"
                    type="number"
                    name="calories"
                    value={mealForm.calories}
                    onChange={handleChange}
                    placeholder="Enter Calories"
                    />
                </div>

                <div className="form-row">
                <div className="form-group">
                  <label>Grams of Protein</label>
                    <input 
                      className="log-input"
                      type="number"
                      name="protein"
                      value={mealForm.protein}
                      onChange={handleChange}
                      placeholder="Enter Grams of Protein"
                    />
                  </div>

                <div className="form-group">
                  <label>Grams of Fiber</label>
                    <input 
                      className="log-input"
                      type="number"
                      name="fiber"
                      value={mealForm.fiber}
                      onChange={handleChange}
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
                      name="carbs"
                      value={mealForm.carbs}
                      onChange={handleChange}
                      placeholder="Enter Grams of Carbs"
                    />
                  </div>

                <div className="form-group">
                  <label>Grams of Fats</label>
                    <input 
                      className="log-input"
                      type="number"
                      name="fats"
                      value={mealForm.fats}
                      onChange={handleChange}
                      placeholder="Enter Grams of Fats"
                    />
                  </div>
                  </div>

                <div className="form-group"> 
                  <label>Time of Meal</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="mealTime" 
                        value="Breakfast"
                        checked={mealForm.mealTime === "Breakfast"}
                        onChange={handleChange}
                      /> 
                      Breakfast
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="mealTime"
                        value="Lunch"
                        checked={mealForm.mealTime === "Lunch"}
                        onChange={handleChange} 
                        /> 
                        Lunch
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="mealTime" 
                        value="Dinner"
                        checked={mealForm.mealTime === "Dinner"}
                        onChange={handleChange}
                        /> 
                        Dinner
                    </label>
                    <label className="radio-option">
                      <input 
                        type="radio" 
                        name="mealTime" 
                        value="Snack"
                        checked={mealForm.mealTime === "Snack"}
                        onChange={handleChange}
                        /> 
                        Snack
                    </label>
                  </div>
                </div>

                <button type="submit" className="log-button">Log Meal</button>
              </form>
            </div> 

            <div className="log-card">
              <div className="log-card-header">
                <div className="log-card-title">Log Your Workouts</div>
                <div className="log-card-subtitle">
                  Track your exercises, sets, reps, and duration.
                </div>
              </div>

              <form className="log-form" onSubmit={handleWorkoutSubmit}>
                <div className="form-group">
                  <label>Workout Type</label>
                  <select 
                    className="log-select"
                    name="workoutType"
                    value={workoutForm.workoutType}
                    onChange={handleWorkoutChange}
                    >
                    <option value="">Select Workout</option>
                    <option value="cardio">Cardio</option>
                    <option value="weight-training">Weight training</option>
                    <option value="low-impact">Low Impact</option>
                  </select> 
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sets</label>
                    <input 
                      className="log-input"
                      type="number"
                      name="sets"
                      value={workoutForm.sets}
                      onChange={handleWorkoutChange}
                      placeholder="Enter sets"
                    />
                  </div>

                  <div className="form-group">
                    <label>Reps</label>
                    <input
                      className="log-input"
                      type="number"
                      name="reps"
                      value={workoutForm.reps}
                      onChange={handleWorkoutChange}
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
                      name="duration"
                      value={workoutForm.duration}
                      onChange={handleWorkoutChange}
                      placeholder="Enter minutes"
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      className="log-input" 
                      type="date"
                      name="date"
                      value={workoutForm.date}
                      onChange={handleWorkoutChange}
                       />
                  </div>
                </div>

                <button type="submit" className="log-button">Log Workout</button>
              </form>
            </div>
          </div> 
        </div> 
      </div> 
    </div>
  ); 
}

export default Logs; 