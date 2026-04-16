import React, {useState} from "react";
import { Link } from "react-router-dom";
import "../styles/Coach.css";
import userimg from "../images/user.svg";

export const coachData=[

];

function Coach() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("coach");

  const handleSearch = () => {
    setSearchQuery(query);
  };


  const filteredCoaches = coachData.filter((coach) => {
    const search = searchQuery.toLowerCase();
    if (coach.role.toLowerCase()!==roleFilter.toLowerCase()){
      return false;
    }
    if (!searchQuery) return true;
    
    const firstName = `${coach.firstName}`.toLowerCase();
    const lastName = `${coach.lastName}`.toLowerCase();
    const specialty = coach.specialty.toLowerCase();


    if (filter === "name") {
      return `${coach.firstName} ${coach.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    }

    if (filter === "specialty") {
      return coach.specialty
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    }

    return firstName.includes(search) || lastName.includes(search) || specialty.includes(search);
  });

  return (
    <div>
    <div className="search-container">
      <input
        type="text" placeholder="Search Coach" className="search-input" value={query} onChange={(e) => 
          setQuery(e.target.value)} />

      <select className="filter-dropdown" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="" disabled>Filter</option>
        <option value="name">Coach Name</option>
        <option value="specialty">Specialty</option>
      </select>
      <select className="filter-dropdown" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
        <option value="coach">Coach</option>
        <option value="nutritionist">Nutritionist</option>
      </select>

      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
    </div>
    <div className="coach-container">
      {filteredCoaches.map((coach)=> (
        <Link key={coach.id} to={`/coach/${coach.id}`} className="coach-card">
          <img src={userimg} alt={coach.firstName} className="avatar"/>
          <h3>{coach.firstName} {coach.lastName}</h3>
          <p>{coach.bio}</p>
          </Link>
      )
      )}
    </div>
    </div>
  );
}

export default Coach;