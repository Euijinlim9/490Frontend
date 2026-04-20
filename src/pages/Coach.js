import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Coach.css";
import userimg from "../images/user.svg";

function Coach() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("coach");

  useEffect(() => {
    const fetchCoaches = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:4000/api/coaches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load coaches");
        const data = await res.json();
        setCoaches(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Could not load coaches. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const handleSearch = () => {
    setSearchQuery(query);
  };

  // TODO: wire up nutritionist endpoint when backend supports it
  const filteredCoaches = coaches.filter((coach) => {
    // Role filter — only coaches for now; nutritionist returns empty until backend is ready
    if (roleFilter === "nutritionist") return false;

    if (!searchQuery) return true;

    const search = searchQuery.toLowerCase();
    const firstName = (coach.first_name || "").toLowerCase();
    const lastName = (coach.last_name || "").toLowerCase();
    const specialty = (coach.Coach?.specialization || "").toLowerCase();

    if (filter === "name") {
      return `${firstName} ${lastName}`.includes(search);
    }

    if (filter === "specialty") {
      return specialty.includes(search);
    }

    return (
      firstName.includes(search) ||
      lastName.includes(search) ||
      specialty.includes(search)
    );
  });

  return (
    <div>
      <div className="coach-page-header">
        <h1>Find Your Coach</h1>
        <p>
          Browse our verified coaches and find the perfect match for your goals.
        </p>
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search Coach"
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
          <option value="name">Coach Name</option>
          <option value="specialty">Specialty</option>
        </select>

        <select
          className="filter-dropdown"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="coach">Coach</option>
          <option value="nutritionist">Nutritionist</option>
        </select>

        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {loading && <p className="coach-status">Loading coaches...</p>}
      {error && <p className="coach-status error">{error}</p>}

      {!loading && !error && filteredCoaches.length === 0 && (
        <p className="coach-status">
          {roleFilter === "nutritionist"
            ? "Nutritionist browsing is coming soon."
            : "No coaches match your search."}
        </p>
      )}

      <div className="coach-container">
        {filteredCoaches.map((coach) => (
          <Link
            key={coach.user_id}
            to={`/coach/${coach.user_id}`}
            className="coach-card"
          >
            <img
              src={coach.profile_pic || userimg}
              alt={coach.first_name}
              className="avatar"
            />
            <h3>
              {coach.first_name} {coach.last_name}
              {coach.Coach?.is_verified && (
                <span className="verified-badge">✓</span>
              )}
            </h3>
            <p className="coach-specialty">
              {coach.Coach?.specialization || "General Coaching"}
            </p>
            <p>{coach.Coach?.bio || "No bio available yet."}</p>
            <div className="coach-card-footer">
              <span>{coach.Coach?.experience_years || 0} yrs</span>
              <span className="coach-price">
                ${coach.Coach?.price || "—"}/hr
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Coach;
