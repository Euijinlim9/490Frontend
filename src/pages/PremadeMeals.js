import "../styles/PremadeMeals.css"; 
import React, { useState, useEffect } from "react";
import { buildBackendUrl } from "../config/api";

function PremadeMeals (){
 const [query, setQuery] = useState("");
 const [searchQuery, setSearchQuery] = useState("");
 const [filter, setFilter] = useState("");
 const [meals, setMeals] = useState([]);
 const [loading, setLoading] = useState(true);

  const handleSearch = () => {
    setSearchQuery(query); 
  }; 

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(buildBackendUrl("/api/meals"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setMeals(data);
      } catch (err) {
        console.error("Failed to fetch meals", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMeals();
  }, []);

  const handleLogMeal = async (meal) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(buildBackendUrl("/api/logs/meal-log"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          meal_id: meal.id,
          date: new Date().toISOString().split("T")[0],
          servings: 1,
        }),
      });

      if (!res.ok) throw new Error("failed to log meal");
      alert(`${meal.name} logged!`);
    } catch (err) {
      console.error(err);
      alert("failed to log meal");
    }
  }; 


    const filteredMeals = meals.filter((meal) => {
    const search = searchQuery.toLowerCase(); 

    const matchesSearch = !searchQuery || meal.name.toLowerCase().includes(search); 
    
    console.log(filter);
    const matchesType = filter === "" ? true: meal.is_premade === (filter === "1");

    return matchesSearch && matchesType;});
  if (loading) {
    return <div>Loading meals...</div>;
  } 

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
          <option value="">
            All Types
          </option>
          <option value="1">Premade</option>
          <option value="0">Custom</option>
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
              <span>{meal.calories_per_serving} cal</span>
              <span>{meal.protein}g protein</span>
              <span>{meal.carbs}g carbs</span>
              <span>{meal.fat}g fats</span>
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