import "../styles/PremadeMeals.css"; 
import React, { suseState } from "react";

function PremadeMeals (){
 const [query, setQuery] = useState("");
 const [searchQuery, setSearchQuery] = useState("");
 const [filter, setFilter] = useState("");
 const [mealTypeFilter, setMealTypeFilter] = useState("");

 const meals = [
    { 
    id: 1,
    name: "Protein Oatmeal Bowl", 
    type: "breakfast", 
    diet: "Vegetarian", 
    calories: 350, 
    protein: 15, 
    carbs: 30, 
    fiber: 4,
    fats: 10, 
    description: "Oats, greek yogurt, berries, and nut butter.",
 }, 
 { 
    id: 2,
    name: "Grilled Chicken Rice Bowl", 
    type: "lunch", 
    diet: "low-cal", 
    calories: 475, 
    protein: 35, 
    carbs: 40, 
    fiber: 6,
    fats: 25, 
    description: "Chicken, brown rice, veggies, and a light sauce.",
 }, 
 { 
    id: 3,
    name: "Chickpea Salad", 
    type: "dinner", 
    diet: "Vegan", 
    calories: 350, 
    protein: 25, 
    carbs: 10, 
    fiber: 8,
    fats: 10, 
    description: "Chickpeas, greens, cucumber, tomata, vinaigrette.",
 }, 
]; 

  const handleSearch = () => {
    setSearchQuery(query); 
  }; 

   const handleLogMeal = (meal) => {
    const savedMeals = JSON.parse(localStorage.getItem("loggedMeals")) || [];

    const newMeal = { 
        mealName: meal.name, 
        mealTime: meal.type, 
        calories: meal.calories, 
        protein: meal.protein, 
        carbs: meal.carbs, 
        fiber: meal.fiber, 
        fats: meal.fats,
        description: meal.description, 
        date: new Date().toLocaleDateString(), 
    }; 

    localStorage.setItem(
        "loggedMeals", JSON.stringify([...savedMeals, newMeal])
    ); 

    alert(`${meal.name} logged!`);
}; 

    const filteredMeals = meals.filter((meal) => {
    const search = searchQuery.toLowerCase(); 

    const matchesSearch = !searchQuery || meal.name.toLowerCase().includes(search); 

    const matchesDiet = !filter || meal.diet === filter; 

    const matchesType = !mealTypeFilter || meal.type === mealTypeFilter; 

    return matchesSearch && matchesDiet && matchesType; 
  }); 

  return ( 
    <div>
      <div className="coach-page-header">
        <h1>Find Your Meal Plan</h1>
        <p>
          Browse meals and log them to track calories and macros.
        </p>
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search Meal"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />

        <select
          className="filter-dropdown"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="" disabled>
            Filter
          </option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="gluten-free">Gluten Free</option>
          <option value="low-cal">Low Calorie</option>
          <option value="">All Diets</option>
        </select>

        <select
          className="filter-dropdown"
          value={mealTypeFilter}
          onChange={(e) => setMealTypeFilter(e.target.value)}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="">All Meals</option>
        </select>

        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
        </div> 
        <div className="meal-container">
          {filteredMeals.map((meal) => (
            <div key={meal.id} className="meal-card">
              <h3>{meal.name}</h3>
              <p>{meal.description}</p>
              <div className="meal-macros">
              <span>{meal.calories} cal</span>
              <span>{meal.protein}g protein</span>
              <span>{meal.carbs}g carbs</span>
              <span>{meal.fats}g fats</span>
              <span>{meal.fiber}g fiber</span>
            </div>

            <div className="meal-card-footer">
              <span>{meal.type}</span>
              <button
                className="log-meal-btn"
                onClick={() => handleLogMeal(meal)}
              >
                Log Meal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PremadeMeals;