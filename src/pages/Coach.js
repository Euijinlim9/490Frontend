import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Coach.css";
import userimg from "../images/user.svg";
import { buildBackendAssetUrl, buildBackendUrl } from "../config/api";

function Coach() {
  const [coaches, setCoaches] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
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
        const [coachRes, nutRes] = await Promise.all([
          fetch(buildBackendUrl("/api/coaches"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(buildBackendUrl("/api/nutritionist"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (coachRes.ok) {
          const coachData = await coachRes.json();
          setCoaches(coachData.data || []);
        }

        if (nutRes.ok) {
          const nutData = await nutRes.json();
          setNutritionists(nutData.data || []);
        }
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

  const usersToShow =
    roleFilter === "nutritionist" ? nutritionists : coaches;

  const filteredCoaches = usersToShow.filter((coach) => {
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
          Browse our verified coaches and nutritionists to find the perfect
          match for your goals.
        </p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder={
            roleFilter === "nutritionist"
              ? "Search Nutritionist"
              : "Search Coach"
          }
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
          <option value="">Filter</option>
          <option value="name">Name</option>
          <option value="specialty">Specialty</option>
        </select>

        <select
          className="filter-dropdown"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setSearchQuery("");
            setQuery("");
          }}
        >
          <option value="coach">Coach</option>
          <option value="nutritionist">Nutritionist</option>
        </select>

        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {loading && roleFilter === "coach" && (
        <p className="coach-status">Loading coaches...</p>
      )}

      {error && roleFilter === "coach" && (
        <p className="coach-status error">{error}</p>
      )}

      {!loading && !error && filteredCoaches.length === 0 && (
        <p className="coach-status">No results match your search.</p>
      )}

      <div className="coach-container">
        {filteredCoaches.map((coach) => (
          <Link
            key={coach.user_id}
            to={
              roleFilter === "nutritionist"
                ? `/nutritionist/${coach.user_id}`
                : `/coach/${coach.user_id}`
            }
            className="coach-card"
          >
            <img
              src={
                coach.profile_pic
                  ? coach.profile_pic.startsWith("http")
                    ? coach.profile_pic
                    : buildBackendAssetUrl(coach.profile_pic)
                  : userimg
              }
              alt={coach.first_name}
              className="avatar"
            />

            {(() => {
              const profile = coach.Coach || coach.Nutritionist || {};
              return (
              <>
              <h3>
                {coach.first_name} {coach.last_name}
                {profile.is_approved && <span className="verified-badge">✓</span>}
              </h3>
              
              <p className="coach-specialty">
                {profile.specialization ||
                (roleFilter === "nutritionist"
                ? "Nutritionist"
                : "General Coaching")}
              </p>

              <p>{profile.bio || "No bio available yet."}</p>

                <div className="coach-card-footer">
                  <span>{profile.experience_years || 0} yrs</span>
                  <span className="coach-price">${profile.price || "—"}/hr</span>
                </div>
                </>
                );
              })()}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Coach;