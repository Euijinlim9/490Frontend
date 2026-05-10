import React, { useEffect, useState } from "react";
import "../styles/NutritionistPlans.css";
import { buildBackendUrl } from "../config/api";

function NutritionistRequests() {
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };



  useEffect(() => { 
      const fetchRequests = async () => {
      try {
      const res = await fetch(buildBackendUrl("/api/nutritionist/requests"), {
        headers: { Authorization: `Bearer ${token}`,
        "X-Active-Role": "nutritionist", }
      });
      if (!res.ok) return;
      const data = await res.json();
      setRequests(data.data || []);
      } catch {} finally {
      setLoading(false);
      }
  };
    fetchRequests(); 
  }, [token]);

  const handleApprove = async (clientUserId) => {
    try {
      const res = await fetch(buildBackendUrl(`/api/nutritionist/requests/${clientUserId}/approve`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` ,
        "X-Active-Role": "nutritionist",}
      });
      if (!res.ok) throw new Error();
      showToast("Request approved!");
      setRequests((prev) => prev.filter((r) => r.client_user_id !== clientUserId));
    } catch { showToast("Failed to approve."); }
  };

  const handleReject = async (clientUserId) => {
    try {
      const res = await fetch(buildBackendUrl(`/api/nutritionist/requests/${clientUserId}/reject`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`,
        "X-Active-Role": "nutritionist",}
      });
      if (!res.ok) throw new Error();
      showToast("Request rejected.");
      setRequests((prev) => prev.filter((r) => r.client_user_id !== clientUserId));
    } catch { showToast("Failed to reject."); }
  };

  return (
    <div className="np-page">
      {toast && <div className="np-toast">{toast}</div>}
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ color: "#fff", marginBottom: 24 }}>Pending Client Requests</h2>

        {loading ? (
          <p style={{ color: "#aaa" }}>Loading...</p>
        ) : requests.length === 0 ? (
          <div className="np-empty-state">
            <div className="np-empty-icon">📬</div>
            <h3>No pending requests</h3>
            <p>New client requests will appear here.</p>
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.client_user_id} 
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "#fff", fontSize: 16 }}>
                  {r.client.first_name} {r.client.last_name}
                </p>
                {r.client.goal && <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: 13 }}>Goal: {r.goal}</p>}
                {r.client.diet_preference && <p style={{ margin: "2px 0 0", color: "#aaa", fontSize: 13 }}>Diet: {r.diet_preference}</p>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="np-btn-assign" onClick={() => handleApprove(r.client_user_id)}>
                  Approve
                </button>
                <button className="np-btn-cancel" onClick={() => handleReject(r.client_user_id)}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NutritionistRequests;
