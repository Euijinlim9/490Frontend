import React, { useEffect, useState } from "react";
import "../../styles/ViewUsers.css"
import "../../styles/CoachApplication.css"

function ViewUsers(){
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:4000/admin/users", {
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
                    `http://localhost:4000/admin/users/${userId}/status`,{
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ is_active: isActive }),
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

    return(
        <div className="viewusers-page">
            {users.map((user) => (
            <div key={user.user_id} className="viewusers-card">
                <h3>{user.first_name} {user.last_name}</h3>
                <h4>{user.role?.toUpperCase()}</h4>
                <button className="view-btn" onClick={() => setSelectedUser(user)}>
                    VIEW USER    
                </button>
            </div>
            ))}
            {selectedUser && (
                <div className="modal-container" onClick={() => setSelectedUser(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
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
                        <div className="btn-footer2">
                        <button className="reject-btn" onClick={() => handleSuspend(selectedUser.user_id, false)}>
                            SUSPEND ACCOUNT
                        </button>
                        <button className="view-btn" onClick={() => setSelectedUser(null)}>
                            BACK
                        </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ViewUsers;