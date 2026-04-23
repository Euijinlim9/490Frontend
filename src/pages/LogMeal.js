import "../styles/Logs.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LogMeal() {
  const navigate = useNavigate();
  const [mealForm, setMealForm] = useState({
    mealName: "",
    calories: "",
    protein: "",
    fiber: "",
    carbs: "",
    fats: "",
    sugars: "",
    mealTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMealForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMealSubmit = (e) => {
    e.preventDefault();

    const savedMeals = JSON.parse(localStorage.getItem("loggedMeals")) || [];

    const newMeal = {
      ...mealForm,
      date: new Date().toLocaleDateString(),
    };

    localStorage.setItem("loggedMeals", JSON.stringify([...savedMeals, newMeal]));

    setMealForm({
      mealName: "",
      calories: "",
      protein: "",
      fiber: "",
      carbs: "",
      fats: "",
      sugars: "",
      mealTime: "",
    }); 
    navigate("/dashboard"); 
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <div className="form-title">Track Your Meals</div>
          <div className="form-subtitle">
            Log your meals, including calorie intake and macros.
          </div>
        </div>

        <form className="form-body" onSubmit={handleMealSubmit}>
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

          <button type="submit" className="form-button">
            Log Meal
          </button>
        </form>
      </div>
    </div>
  );
}

export default LogMeal;