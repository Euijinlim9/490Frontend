import React, { useEffect, useState } from "react";
import "../../styles/CoachApplication.css";

function CoachApplication(){
    const[coaches, setCoaches] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchData = async () => {
            try{
                const rest = await fetch(
                    "http://localhost:4000/admin/pending?role",
                    {
                        headers: {Authorization: `Bearer ${token}`},
                    }
                );
                const data = await rest.json();
                if (!rest.ok){
                    throw new Error(data.message || "Failed to fetch pending coaches");
                }
                setCoaches(data.pending);
            } catch (err){
                console.error("No Available Information", err);
            }
        };
        fetchData();
    }, []);

    const handleApprove = async (userId, approved) => {
        const token = localStorage.getItem("token");
        try{
            const res = await fetch(
                `http://localhost:4000/admin/users/${userId}/approve`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({approved}),
                }
            );
            const data = await res.json();

            if (!res.ok){
                throw new Error(data.message || "Failed to update approval");
            }
            setCoaches((prev) =>
                prev.filter((c) => c.user_id !== userId)
            );
            setSelectedCoach(null);
        }catch (err) {
            console.error("Error updating coach approval:", err);
        }
    };

    const handleSearch = () => {
    setSearchQuery(query);
};

    const filterCoach = coaches.filter((c) => {
    if (!searchQuery) return true;

    const search = searchQuery.toLowerCase();
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const status = (c.role === "coach" ?
        c.Coach?.is_approved : c.Nutritionist?.is_approved) ? "approved" : "pending";
    const role = (c.role || "").toLowerCase();

    if (filter === "name") {
      return name.includes(search);
    }

    if (filter === "status") {
      return status.includes(search);
    }

    if (filter === "role") {
      return role.includes(search);
    }

    return (
      name.includes(search) ||
      status.includes(search) ||
      role.includes(search)
    );
  });

    return(
    <div className="coach-app-container">
        <div className="report-header">
            <h2>Pending Applications</h2>
                    <div className="search-container">
                    <input
                    type="text"
                    placeholder="Search Applications"
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
          <option value="name">Name</option>
          <option value="status">Status</option>
          <option value="role">Role</option>
        </select>
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
            </div>
        </div>
        {filterCoach.map((coach) => (
          <div
            key={coach.user_id}
            className="coach-app-card"
          >
            <h3>
              {coach.first_name} {coach.last_name}
            </h3>
                    <button className="view-btn" onClick={() => setSelectedCoach(coach)}>
                        VIEW
                    </button>
                    <div className="btn-footer">
                        <button className="accept-btn" onClick={() => handleApprove(coach.user_id, true)}>
                            ACCEPT
                            </button>
                            <button className="reject-btn" type="button" onClick={() => handleApprove(coach.user_id, false)}>
                                REJECT
                            </button>
            </div>
          </div>
          ))}
          {selectedCoach && (
            <div className="modal-container" onClick={() => setSelectedCoach(null)}>
                <div className="modal" onClick={(e)=> e.stopPropagation()}>
                    <div className="modal-header2">
                        <h2>{selectedCoach.first_name} {selectedCoach.last_name}'s Application</h2>
                    </div>
                    <div className="modal-content">
                        <p>Name: {selectedCoach.first_name} {selectedCoach.last_name}</p>
                        <p>Role: {selectedCoach.role}</p>
                        <p>Email: {selectedCoach.email}</p>
                        <p>Phone Number: {selectedCoach.phone}</p>
                        <h5>Certifications:</h5>
                        {selectedCoach.Coach?.CoachCertifications?.map((c, i) => (
                            <div key={c.certification_id}>
                                <p>Status: {c.status}</p>
                                <a href={c.document_url}
                                target="_blank"
                                rel="noreferrer">
                                    View Document
                                </a>
                            </div>
                        ))}
                    </div>
                    <div className="btn-footer">
                        <button className="accept-btn" onClick={() => handleApprove(selectedCoach.user_id, true)}>
                            ACCEPT
                        </button>
                        <button className="reject-btn" type="button" onClick={() => handleApprove(selectedCoach.user_id, false)}>
                            REJECT
                        </button>
            </div>
            <button className="view-btn" type="button" onClick={() => setSelectedCoach(null)}>
                BACK
            </button>
            </div>

            </div>
          )}
          </div>
    );
}

export default CoachApplication;

