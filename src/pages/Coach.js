import React, {useState} from "react";
import "../styles/Coach.css";
import userimg from "../images/user.svg";

function Coach() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");

  const handleSearch = () => {
    console.log({ query, filter });
  };

  const coachData=[
    {
      id: 1,
      firstName: "Joe",
      lastName: "Smith",
      username: "@joesmith123",
      bio: "Short workouts, Big results. I'm Coach Joe and I help busy people burn fat and build endurance.",
      specialty: "Cardio",
  }, 
  {
    id: 2,
    firstName: "Jane",
    lastName: "Johnson",
    username: "@janejohn14",
    bio: "Fitness isn't just about lifting weights, it's about moving well for life. I'm Jane and I focus on body building.",
    specialty: "Body building",
  },
  {
    id: 3,
    firstName: "Nathan",
    lastName: "Aaron",
    username: "@coachnat",
    bio: "Starting fitness can feel intimidating. I'm Nathan and I specialize in helping beginners with strength and balance training.",
    specialty: "Athletic sports",
  },
];

  const filteredCoaches = coachData.filter((coach) => {
    if (!query) return true;

    if (filter === "name") {
      return `${coach.firstName} ${coach.lastName}`
        .toLowerCase()
        .includes(query.toLowerCase());
    }

    if (filter === "specialty") {
      return coach.specialty
        .toLowerCase()
        .includes(query.toLowerCase());
    }
    return true;
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

      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
    </div>
    <div className="coach-container">
      {filteredCoaches.map((coach)=> (
        <div key={coach.id} className="coach-card">
          <img src={userimg} alt={coach.firstName} className="avatar"/>
          <h3>{coach.firstName} {coach.lastName}</h3>
          <p>{coach.bio}</p>
          <p>{coach.username}</p>
          </div>
      )
      )}
    </div>
    </div>
  );
}

export default Coach;