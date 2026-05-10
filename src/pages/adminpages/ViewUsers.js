import React, { useEffect, useState } from "react";
import "../../styles/ViewUsers.css"
import "../../styles/CoachApplication.css"
import { buildBackendUrl } from "../../config/api";

function ViewUsers(){
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("");
    const [confirmModal, setConfirmModal] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchData = async () => {
            try {
                const res = await fetch(buildBackendUrl("/admin/users"), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if(!res.ok){
                    throw new Error(data.message || "Cannot fetch users");
                }
                setUsers(data.users);
                } catch (err){
                    console.error("Error fetching users:", err);
                }
            };
                fetchData();
            }, []);

        const handleSuspend = async (userId, isActive) => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(
                    buildBackendUrl(`/admin/users/${userId}/status`),{
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ is_active: Boolean(isActive) }),
                    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update status");
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.user_id === userId ? { ...u, is_active: isActive } : u
      )
    );
  } catch (err) {
    console.error("Error updating user:", err);
  }
};

    const handleSearch = () => {
        setSearchQuery(query);
    };

    const filteredUsers = users.filter((r) => {
        if (!searchQuery) return true;

        const search = searchQuery.toLowerCase();
        const name = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
        const role = (r.role || "").toLowerCase();

        if (filter === "name") {
        return name.includes(search);
        }

        if (filter === "role") {
        return role.includes(search);
        }

    return (
      name.includes(search) ||
      role.includes(search) 
    );
  });

    const confirmSuspend = async () => {
        if (!pendingUser) return;

        await handleSuspend(pendingUser.user_id, false);

        setConfirmModal(false);
        setSelectedUser(null);
        setPendingUser(null);
    };

    return(
        <div className="viewusers-page">
            <div className="report-header">
                <h2>List of All Users</h2>
            </div>
            <div className="search-container">
                    <input
                    type="text"
                    placeholder="Search Users"
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
                        <option value="category">Role</option>
                        </select>
                        <button className="search-button" onClick={handleSearch}>
                        Search
                        </button>
            </div>
            <div className="viewusers-container">
            {filteredUsers.map((user) => (
            <div key={user.user_id} className="viewusers-card">
                <h3>{user.first_name} {user.last_name}</h3>
                <h4>{user.role?.toUpperCase()}</h4>
                <button className="view-btn" onClick={() => setSelectedUser(user)}>
                    VIEW USER    
                </button>
            </div>
            ))}
            </div>
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedUser.first_name} {selectedUser.last_name}</h2>
                        <p>Role: {selectedUser.role}</p>
                        <p>Email: {selectedUser.email}</p>
                        <p>Phone Number: {selectedUser.phone}</p>
                        <p>Last Logged in: {""}
                            {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString()
                            : "Never"}
                        </p>
                        <p>Status: {selectedUser.is_active ? "Active" : "Suspended"}</p>

                        {selectedUser.role ==="coach" && (
                            <>
                            <h5>Certifications:</h5>
                            {selectedUser.Coach?.CoachCertifications?.map((c) => (
                                <div key={c.certification_id}>
                                    <p>Status: {c.status}</p>
                                    <a href={c.document_url} target="_blank" rel="noreferrer">
                                        View Certification Document
                                    </a>
                                </div>
                            ))}
                            </>
                        )}
                        <div className="report-btn-footer">
                        <button className="report-back-btn suspend" 
                        onClick={() => {
                            setPendingUser(selectedUser);
                            setConfirmModal(true);}} >
                            SUSPEND ACCOUNT
                        </button>
                        <button className="report-back-btn" onClick={() => setSelectedUser(null)}>
                            BACK
                        </button>
                        </div>
                    </div>
                </div>
            )}
            {confirmModal && (
                <div className="modal-overlay" onClick={() => setConfirmModal(false)}>
                    <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Confirm Suspension</h2>
                        <p>
                            Are you sure you want to suspend{" "}
                            <strong>{pendingUser?.first_name} {pendingUser?.last_name}</strong>?                            ?
                        </p>
                        <div className="report-btn-footer">
                            <button className="report-back-btn" onClick={() => setConfirmModal(false)}>
                                Cancel
                            </button>
                            <button className="report-back-btn suspend" onClick={confirmSuspend}>
                                Yes, Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ViewUsers;