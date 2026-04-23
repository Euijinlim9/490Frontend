import "../styles/PremadeMeals.css"; 
import React, { useEffect, useState } from "react";

function PremadeMeals (){
 const [query, setQuery] = useState("");
 const [searchQuery, setSearchQuery] = useState("");
 const [filter, setFilter] = useState("");
 const [roleFilter, setRoleFilter] = useState("coach");

  const handleSearch = () => {
    setSearchQuery(query); 
  }; 

  return ( 
    <div>
      <div className="coach-page-header">
        <h1>Find Your Meal Plan</h1>
        <p>
          Browse our verified meals and find the perfect match for your goals.
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
        </select>

        <select
          className="filter-dropdown"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="breafast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>

        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
        </div> 
    </div> 
  )
}; 

export default PremadeMeals;