import React, {useState} from "react";
import "../styles/Coach.css";

function Coach() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");

  const handleSearch = () => {
    console.log({ query, filter });
  };

  return (
    <div className="search-container">
      <input
        type="text" placeholder="Search Coach" className="search-input" value={query} onChange={(e) => 
          setQuery(e.target.value)} />

      <select className="filter-dropdown" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="" disabled>Filter</option>
        <option value="name">Coach Name</option>
        <option value="specialty">Specialty</option>
      </select>

      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
}

export default Coach;