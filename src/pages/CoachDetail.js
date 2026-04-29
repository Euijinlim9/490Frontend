import React, { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import userimg from "../images/user.svg";
import { AuthContext } from "../context/AuthContext";
import "../styles/CoachDetail.css";

function CoachDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeRole } = useContext(AuthContext);

  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myCoachState, setMyCoachState] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  // Plans
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Subscribe modal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("");

  // Report
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  useEffect(() => {
    const fetchCoach = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:4000/api/coaches/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) {
          setError("Coach not found");
          return;
        }
        if (!res.ok) throw new Error("Failed to load coach");
        const data = await res.json();
        setCoach(data);
      } catch (err) {
        setError("Could not load coach. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoach();
  }, [id]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/coaches/${id}/plans`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPlans(data);
      } catch {
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, [id]);

  useEffect(() => {
    if (activeRole === "coach") {
      setMyCoachState("not_a_client");
      return;
    }
    const fetchMyCoach = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:4000/api/client/my-coach", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        });
        if (!res.ok) {
          setMyCoachState("none");
          return;
        }
        const data = await res.json();
        setMyCoachState(data.state);
      } catch {
        /* silent */
      }
    };
    fetchMyCoach();
  }, [activeRole]);

  useEffect(() => {
    const savedReviews =
      JSON.parse(localStorage.getItem(`coachReviews-${id}`)) || [];
    setReviews(savedReviews);
  }, [id]);

  const handleRequest = async () => {
    if (!window.confirm(`Send a coaching request to ${coach.first_name}?`))
      return;
    setRequesting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:4000/api/coaches/${id}/request`,
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
        alert(data.error || "You already have a coach request.");
        return;
      }
      if (!res.ok) throw new Error("Failed to send request");

      const existingNotifications =
        JSON.parse(
          localStorage.getItem(`coachNotifications-${coach.user_id}`)
        ) || [];
      const newNotification = {
        message: `${user?.first_name} sent you a coaching request`,
        date: new Date().toLocaleString(),
        read: false,
      };
      localStorage.setItem(
        `coachNotifications-${coach.user_id}`,
        JSON.stringify([newNotification, ...existingNotifications])
      );

      navigate("/dashboard");
    } catch {
      alert("Could not send request. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubscribing(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Active-Role": activeRole,
        },
        body: JSON.stringify({ coaching_plan_id: selectedPlan.plan_id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Subscription failed.");
        return;
      }
      setSelectedPlan(null);
      navigate("/dashboard");
    } catch {
      alert("Could not complete subscription. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !reviewRating) {
      alert("Please add a rating and a review.");
      return;
    }
    const savedReviews =
      JSON.parse(localStorage.getItem(`coachReviews-${id}`)) || [];
    const newReview = {
      rating: Number(reviewRating),
      comment: reviewText,
      clientName: user?.first_name || "Client",
      date: new Date().toLocaleDateString(),
    };
    const updatedReviews = [...savedReviews, newReview];
    localStorage.setItem(`coachReviews-${id}`, JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
    setReviewText("");
    setReviewRating("");
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportReason || !reportDetails.trim()) {
      alert("Please choose a reason and add details.");
      return;
    }
    const savedReports =
      JSON.parse(localStorage.getItem(`coachReports-${id}`)) || [];
    const newReport = {
      coachId: id,
      coachName: `${coach.first_name} ${coach.last_name}`,
      clientName: user?.first_name || "Client",
      reason: reportReason,
      details: reportDetails,
      date: new Date().toLocaleDateString(),
    };
    localStorage.setItem(
      `coachReports-${id}`,
      JSON.stringify([...savedReports, newReport])
    );
    alert("Report submitted. Thank you for letting us know.");
    setReportReason("");
    setReportDetails("");
    setShowReportForm(false);
  };

  if (loading)
    return (
      <div className="cp-page">
        <div className="cp-status">Loading...</div>
      </div>
    );
  if (error || !coach)
    return (
      <div className="cp-page">
        <div className="cp-status">
          <h2>{error || "Coach not found"}</h2>
          <Link to="/coach" className="cp-back-fallback">
            ← Back to coaches
          </Link>
        </div>
      </div>
    );

  const isSelf = user && coach && user.user_id === coach.user_id;
  const hasPlans = plans.length > 0;
  const canSubscribe = activeRole === "client" && !isSelf;
  const canRequest =
    activeRole === "client" && myCoachState === "none" && !isSelf && !hasPlans;

  const headerButton = (() => {
    if (isSelf) return null;
    if (activeRole !== "client") return null;
    if (hasPlans) return null;
    const label = (() => {
      if (myCoachState === "pending") return "Request Pending";
      if (myCoachState === "active") return "You already have a coach";
      if (requesting) return "Sending...";
      return "Request this Coach";
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

  const hourlyRate = coach.Coach?.price || 50;

  return (
    <div className="cp-page">
      <Link to="/coach" className="cp-back">
        ← Back
      </Link>

      <div className="cp-container">
        {/* Header card */}
        <div className="cp-header-card">
          <div className="cp-cover"></div>
          <div className="cp-header-body">
            <img
              src={coach.profile_pic || userimg}
              alt={coach.first_name}
              className="cp-avatar"
            />
            <div className="cp-header-main">
              <div className="cp-title-row">
                <div>
                  <h1 className="cp-name">
                    {coach.first_name} {coach.last_name}
                    {coach.Coach?.is_verified && (
                      <span className="cp-verified">✓ Verified</span>
                    )}
                  </h1>
                  <p className="cp-subtitle">
                    {coach.Coach?.specialization || "General Coaching"} · Coach
                  </p>
                </div>
                {headerButton}
                {activeRole === "client" && !isSelf && (
                  <button
                    className="cp-report-btn"
                    onClick={() => setShowReportForm((prev) => !prev)}
                  >
                    Report Coach
                  </button>
                )}
              </div>
              <div className="cp-stats">
                <div className="cp-stat">
                  <span className="cp-stat-value">
                    {coach.Coach?.experience_years || 0}y
                  </span>
                  <span className="cp-stat-label">Experience</span>
                </div>
                <div className="cp-stat">
                  <span className="cp-stat-value">${hourlyRate}</span>
                  <span className="cp-stat-label">Per hour</span>
                </div>
                <div className="cp-stat">
                  <span className="cp-stat-value">
                    {reviews.length > 0
                      ? (
                          reviews.reduce((sum, r) => sum + r.rating, 0) /
                          reviews.length
                        ).toFixed(1)
                      : "New"}
                  </span>
                  <span className="cp-stat-label">Rating</span>
                </div>
                <div className="cp-stat">
                  <span className="cp-stat-value">
                    {coach.Coach?.is_verified ? "Yes" : "No"}
                  </span>
                  <span className="cp-stat-label">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report form */}
        {showReportForm && (
          <div className="cp-card">
            <h3 className="cp-card-title">Report Coach</h3>
            <form className="cp-report-form" onSubmit={handleReportSubmit}>
              <select
                className="cp-report-select"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="Inappropriate behavior">
                  Inappropriate Behavior
                </option>
                <option value="Scam or suspicious activity">
                  Scam or suspicious activity
                </option>
                <option value="False information">False information</option>
                <option value="Harassment">Harassment</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                className="cp-report-input"
                placeholder="Explain what happened.."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />
              <button type="submit" className="cp-report-submit">
                Submit Report
              </button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="cp-tabs">
          {["about", "packages", "reviews", "certifications"].map((tab) => (
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
          <>
            <div className="cp-card">
              <h3 className="cp-card-title">Bio</h3>
              <p className="cp-bio">
                {coach.Coach?.bio || "This coach hasn't added a bio yet."}
              </p>
            </div>
            <div className="cp-card">
              <h3 className="cp-card-title">Specialization</h3>
              <div className="cp-chips">
                <span className="cp-chip">
                  {coach.Coach?.specialization || "General Coaching"}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Packages */}
        {activeTab === "packages" && (
          <>
            <div className="cp-section-header">
              <h3>Coaching Plans</h3>
              <p>
                Choose a plan and subscribe to start working with{" "}
                {coach.first_name}.
              </p>
            </div>

            {plansLoading ? (
              <div className="cp-card cp-empty">
                <p>Loading plans...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="cp-card cp-empty">
                <div className="cp-empty-icon">📋</div>
                <h3>No plans available</h3>
                <p>
                  {coach.first_name} hasn't published any coaching plans yet.
                </p>
                {canRequest && (
                  <button
                    className="cp-program-btn"
                    onClick={handleRequest}
                    disabled={requesting}
                  >
                    {requesting ? "Sending..." : "Request this Coach instead"}
                  </button>
                )}
              </div>
            ) : (
              <div className="cp-programs-grid">
                {plans.map((plan, i) => (
                  <div
                    key={plan.plan_id}
                    className={`cp-program-card ${i === 1 ? "featured" : ""}`}
                  >
                    {i === 1 && (
                      <div className="cp-program-badge">Most Popular</div>
                    )}
                    <h4 className="cp-program-title">{plan.title}</h4>
                    <div className="cp-program-price">
                      <span className="cp-program-currency">$</span>
                      {Number(plan.price).toFixed(0)}
                      <span className="cp-program-period">
                        / {plan.plan_duration} days
                      </span>
                    </div>
                    {plan.description && (
                      <p className="cp-program-desc">{plan.description}</p>
                    )}
                    <button
                      className="cp-program-btn"
                      disabled={!canSubscribe}
                      onClick={() => canSubscribe && setSelectedPlan(plan)}
                    >
                      {!canSubscribe
                        ? activeRole === "coach"
                          ? "Coaches can't subscribe"
                          : "Sign in as client"
                        : "Select Plan"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Book a Session — placeholder */}
            <div className="cp-section-header">
              <h3>Book a Session</h3>
              <p>One-off or bundled sessions at the coach's hourly rate.</p>
            </div>
            <div className="cp-booking-card">
              <div className="cp-booking-info">
                <div className="cp-booking-rate">
                  <span className="cp-booking-price">${hourlyRate}</span>
                  <span className="cp-booking-unit">/ hour</span>
                </div>
                <p className="cp-booking-desc">
                  Schedule a single session or buy a bundle at a discount.
                </p>
                <div className="cp-booking-bundles">
                  <div className="cp-bundle">
                    <span className="cp-bundle-count">1 Session</span>
                    <span className="cp-bundle-price">${hourlyRate}</span>
                  </div>
                  <div className="cp-bundle">
                    <span className="cp-bundle-count">5 Sessions</span>
                    <span className="cp-bundle-price">
                      ${Math.round(hourlyRate * 5 * 0.9)}
                    </span>
                    <span className="cp-bundle-save">Save 10%</span>
                  </div>
                  <div className="cp-bundle">
                    <span className="cp-bundle-count">10 Sessions</span>
                    <span className="cp-bundle-price">
                      ${Math.round(hourlyRate * 10 * 0.85)}
                    </span>
                    <span className="cp-bundle-save">Save 15%</span>
                  </div>
                </div>
              </div>
              <button className="cp-booking-btn" disabled>
                Coming Soon
              </button>
            </div>
          </>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div className="cp-card">
            <h3 className="cp-card-title">Client Reviews</h3>
            {activeRole === "client" && !isSelf && (
              <form className="cp-review-form" onSubmit={handleReviewSubmit}>
                <textarea
                  placeholder="Write your review here..."
                  className="cp-review-input"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <select
                  className="cp-review-rating"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                >
                  <option value="">Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <button type="submit" className="cp-review-btn">
                  Submit Review
                </button>
              </form>
            )}
            <div className="cp-reviews-list">
              {reviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                reviews.map((review, index) => (
                  <div key={index} className="cp-review-card">
                    <div className="cp-review-stars">
                      {"⭐".repeat(review.rating)}
                    </div>
                    <p>{review.comment}</p>
                    <span>
                      {review.clientName} · {review.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {activeTab === "certifications" && (
          <div className="cp-card cp-empty">
            <div className="cp-empty-icon">🎓</div>
            <h3>No certifications listed</h3>
            <p>
              {coach.first_name} hasn't added certifications to their profile
              yet.
            </p>
          </div>
        )}
      </div>

      {/* Subscribe modal */}
      {selectedPlan && (
        <div
          className="cp-modal-overlay"
          onClick={() => !subscribing && setSelectedPlan(null)}
        >
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="cp-modal-close"
              onClick={() => setSelectedPlan(null)}
            >
              ✕
            </button>
            <h3 className="cp-modal-title">Confirm Subscription</h3>
            <div className="cp-modal-plan-name">{selectedPlan.title}</div>
            <div className="cp-modal-details">
              <div className="cp-modal-row">
                <span>Duration</span>
                <strong>{selectedPlan.plan_duration} days</strong>
              </div>
              <div className="cp-modal-row">
                <span>Total</span>
                <strong>
                  ${Number(selectedPlan.price).toFixed(2)}{" "}
                  {selectedPlan.currency}
                </strong>
              </div>
              <div className="cp-modal-row">
                <span>Coach</span>
                <strong>
                  {coach.first_name} {coach.last_name}
                </strong>
              </div>
            </div>
            {selectedPlan.description && (
              <p className="cp-modal-desc">{selectedPlan.description}</p>
            )}
            <button
              className="cp-modal-confirm-btn"
              onClick={handleSubscribe}
              disabled={subscribing}
            >
              {subscribing ? "Processing..." : "Confirm Payment"}
            </button>
            <p className="cp-modal-disclaimer">
              This is a simulated payment. No real charge will be made.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoachDetail;
