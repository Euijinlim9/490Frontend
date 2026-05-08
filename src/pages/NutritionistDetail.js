import React, { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import userimg from "../images/user.svg";
import { AuthContext } from "../context/AuthContext";
import "../styles/CoachDetail.css";

function NutritionistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeRole } = useContext(AuthContext);

  const [nutritionist, setNutritionist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myNutritionistState, setMyNutritionistState] = useState(null);
  const [myNutritionistId, setMyNutritionistId] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [showFireConfirm, setShowFireConfirm] = useState(false);
  const [showFireSuccess, setShowFireSuccess] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNutritionist = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/nutritionist/browse/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 404) { setError("Nutritionist not found"); return; }
        if (!res.ok) throw new Error();
        setNutritionist(await res.json());
      } catch {
        setError("Could not load nutritionist. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchNutritionist();
  }, [id, token]);

  useEffect(() => {
    if (activeRole === "coach" || activeRole === "nutritionist") {
      setMyNutritionistState("not_a_client");
      return;
    }
    const fetchMyNutritionist = async () => {
      try {
        const res = await fetch(
          "http://localhost:4000/api/nutritionist/my-nutritionist",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": activeRole,
            },
          }
        );
        if (!res.ok) { setMyNutritionistState("none"); return; }
        const data = await res.json();
        setMyNutritionistState(data.state);
        setMyNutritionistId(data.nutritionist?.user_id);
      } catch { /* silent */ }
    };
    fetchMyNutritionist();
  }, [activeRole, token]);

  const handleRequest = async () => {
    if (!window.confirm(`Send a request to ${nutritionist.first_name}?`)) return;
    setRequesting(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/nutritionist/request/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }
      );
      if (res.status === 409) {
        const data = await res.json();
        alert(data.error || "You already have a nutritionist request.");
        return;
      }
      if (!res.ok) throw new Error();
      setMyNutritionistState("pending");
      navigate("/dashboard");
    } catch {
      alert("Could not send request. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  const handleUnhire = async () => {
    try {
      const res = await fetch(
        "http://localhost:4000/api/nutritionist/my-nutritionist",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }
      );
      if (!res.ok) throw new Error();
      setMyNutritionistState("none");
      setMyNutritionistId(null);
      setShowFireConfirm(false);
      setShowFireSuccess(true);
    } catch {
      alert("Could not remove nutritionist. Try again.");
      setShowFireConfirm(false);
    }
  };

  if (loading) return <div className="cp-page"><div className="cp-status">Loading...</div></div>;
  if (error || !nutritionist)
    return (
      <div className="cp-page">
        <div className="cp-status">
          <h2>{error || "Nutritionist not found"}</h2>
          <Link to="/coach" className="cp-back-fallback">← Back</Link>
        </div>
      </div>
    );

  const isSelf = user && nutritionist && user.user_id === nutritionist.user_id;
  const isClient = activeRole === "client";
  const canRequest = isClient && !isSelf && myNutritionistState === "none";
  const isMyNutritionist =
    isClient &&
    !isSelf &&
    myNutritionistState === "active" &&
    Number(myNutritionistId) === Number(nutritionist.user_id);

  const headerButton = (() => {
    if (isSelf || !isClient) return null;
    const label = (() => {
      if (myNutritionistState === "pending") return "Request Pending";
      if (myNutritionistState === "active") return "Nutritionist Already Hired";
      if (requesting) return "Sending...";
      return "Request this Nutritionist";
    })();
    return (
      <button
        className="cp-request-btn"
        onClick={handleRequest}
        disabled={!canRequest || requesting}
      >
        {label}
      </button>
    );
  })();

  return (
    <div className="cp-page">
      <Link to="/coach" className="cp-back">← Back</Link>

      <div className="cp-container">
        {/* Header card */}
        <div className="cp-header-card">
          <div className="cp-cover"></div>
          <div className="cp-header-body">
            <img
              src={nutritionist.profile_pic || userimg}
              alt={nutritionist.first_name}
              className="cp-avatar"
            />
            <div className="cp-header-main">
              <div className="cp-title-row">
                <div>
                  <h1 className="cp-name">
                    {nutritionist.first_name} {nutritionist.last_name}
                    {nutritionist.Nutritionist?.is_approved && (
                      <span className="cp-verified">✓ Verified</span>
                    )}
                  </h1>
                  <p className="cp-subtitle">Nutritionist</p>
                </div>
                <div className="cp-btn-header">
                  {headerButton}
                  {isMyNutritionist && (
                    <button
                      className="cp-fire-btn"
                      onClick={() => setShowFireConfirm(true)}
                    >
                      Remove Nutritionist
                    </button>
                  )}
                </div>
              </div>
              <div className="cp-stats">
                <div className="cp-stat">
                  <span className="cp-stat-value">
                    {nutritionist.Nutritionist?.is_approved ? "Yes" : "No"}
                  </span>
                  <span className="cp-stat-label">Verified</span>
                </div>
                {nutritionist.Nutritionist?.price && (
                  <div className="cp-stat">
                    <span className="cp-stat-value">
                      ${nutritionist.Nutritionist.price}
                    </span>
                    <span className="cp-stat-label">Per session</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="cp-tabs">
          {["about"].map((tab) => (
            <button
              key={tab}
              className={`cp-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* About */}
        {activeTab === "about" && (
          <div className="cp-card">
            <h3 className="cp-card-title">About</h3>
            <p className="cp-bio">
              {nutritionist.Nutritionist?.bio ||
                `${nutritionist.first_name} hasn't added a bio yet.`}
            </p>
          </div>
        )}
      </div>

      {/* Fire confirm modal */}
      {showFireConfirm && (
        <div className="cp-modal-overlay" onClick={() => setShowFireConfirm(false)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cp-modal-close" onClick={() => setShowFireConfirm(false)}>✕</button>
            <h3 className="cp-modal-title">Remove Nutritionist?</h3>
            <p className="cp-modal-desc">
              Are you sure you want to remove {nutritionist.first_name}{" "}
              {nutritionist.last_name}? This will end your relationship.
            </p>
            <div className="cp-modal-actions">
              <button className="cp-modal-confirm-btn" onClick={handleUnhire}>
                Yes, Remove
              </button>
              <button className="cp-btn cp-btn-ghost" onClick={() => setShowFireConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFireSuccess && (
        <div className="cp-modal-overlay" onClick={() => setShowFireSuccess(false)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cp-modal-close" onClick={() => setShowFireSuccess(false)}>✕</button>
            <h3 className="cp-modal-title">Removed Successfully</h3>
            <p className="cp-modal-desc">
              Your relationship with {nutritionist.first_name}{" "}
              {nutritionist.last_name} has been ended.
            </p>
            <button className="cp-modal-confirm-btn" onClick={() => setShowFireSuccess(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NutritionistDetail;
