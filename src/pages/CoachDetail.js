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
  const [showFireConfirm, setShowFireConfirm] = useState(false);
  const [showFireSuccess, setShowFireSuccess] = useState(false);

  // Plans
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Subscribe modal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  // Packages (session bundles)
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [activePurchase, setActivePurchase] = useState(null); // existing credits with this coach

  // Package purchase modal
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [myCoachId, setMyCoachId] = useState(null);

  // Report
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  //coach assigned workouts
  const [assignedWorkouts, setAssignedWorkouts] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [responding, setResponding] = useState(false);
  const [responseModal, setResponseModal] = useState(null); 

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
    const fetchPackages = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/coaches/${id}/packages`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPackages(data.packages || []);
      } catch {
        setPackages([]);
      } finally {
        setPackagesLoading(false);
      }
    };
    fetchPackages();
  }, [id]);

  // Check if client already has active credits with this coach
  useEffect(() => {
    if (activeRole !== "client") return;
    const fetchActivePurchase = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:4000/api/sessions/purchases/active-with/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": "client",
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        setActivePurchase(data.purchase);
      } catch {
        /* silent */
      }
    };
    fetchActivePurchase();
  }, [id, activeRole]);

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
        setMyCoachId(data.coach?.user_id);
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

  useEffect(() => {
    if (activeTab !== "workouts" || myCoachState !== "active") return;
    const fetchAssigned = async () => {
      setAssignedLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "http://localhost:4000/api/client/my-assigned-workouts?status=assigned,accepted",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": "client",
            },
          }
        );
        const data = await res.json();
        setAssignedWorkouts(
          (data.data || []).filter((w) => w.coach_user_id === parseInt(id) &&
          w.status !== "declined"
        )
      );
      } catch (err) {
        console.error(err);
      } finally {
        setAssignedLoading(false);
      }
    };
    fetchAssigned();
  }, [activeTab, myCoachState, id]);

  const handleAssignmentAccept = async (assignmentId) => {
    setResponding(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:4000/api/client/assignments/${assignmentId}/accept`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": "client",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to accept");
      const accepted = assignedWorkouts.find(
        (w) => w.assigned_workout_id === assignmentId
      );
      setAssignedWorkouts((prev) =>
        prev.map((w) =>
          w.assigned_workout_id === assignmentId
            ? { ...w, status: "accepted" }
            : w
        )
      );
      setResponseModal({
        type: "accepted",
        title: accepted?.Workout?.title || "Workout",
      });
    } catch (err) {
      alert("Something went wrong. Try again.");
    } finally {
      setResponding(false);
    }
  };

  const handleDeclineSubmit = async (assignmentId) => {
    if (!declineReason.trim()) return;
    setResponding(true);
    const token = localStorage.getItem("token");
    try {
      const declined = assignedWorkouts.find(
        (w) => w.assigned_workout_id === assignmentId
      );

      const res = await fetch(
        `http://localhost:4000/api/client/assignments/${assignmentId}/decline`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Active-Role": "client",
          },
          body: JSON.stringify({ decline_reason: declineReason }),
        }
      );
      if (!res.ok) throw new Error("Failed to decline");
      setAssignedWorkouts((prev) =>
        prev.filter((w) => w.assigned_workout_id !== assignmentId)
      );
      setDeclineTarget(null);
      setDeclineReason("");
      setResponseModal({
      type: "declined",
      title: declined?.Workout?.title || "Workout",
    });
    } catch (err) {
      alert("Something went wrong. Try again.");
    } finally {
      setResponding(false);
    }
  };

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

  const handlePurchasePackage = async () => {
    if (!selectedPackage) return;
    setPurchasing(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/sessions/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Active-Role": activeRole,
        },
        body: JSON.stringify({ package_id: selectedPackage.package_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Purchase failed.");
        return;
      }
      setSelectedPackage(null);
      setActivePurchase({
        purchase_id: data.purchase.purchase_id,
        sessions_remaining: data.purchase.sessions_remaining,
        total_sessions: data.purchase.total_sessions,
      });
      alert(
        `Purchased! ${data.purchase.sessions_remaining} sessions ready to book.`
      );
    } catch {
      alert("Could not complete purchase. Please try again.");
    } finally {
      setPurchasing(false);
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

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason || !reportDetails.trim()) {
      alert("Please choose a reason and add details.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:4000/api/coaches/${coach.user_id}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: reportReason,
            title: reportReason,
            description: reportDetails,
            severity: "medium",
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to submit report.");
        return;
      }

      alert("Report submitted. Thank you for letting us know.");
      setReportReason("");
      setReportDetails("");
      setShowReportForm(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    }
  };

  const handleUnhireCoach = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/client/my-coach", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Active-Role": activeRole,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to unhire coach");
      }

      setMyCoachState("none");
      setMyCoachId(null);
      setShowFireConfirm(false);
      setShowFireSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Could not unhire coach. Try again.");
      setShowFireConfirm(false);
    }
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

  const canReview =
    activeRole === "client" &&
    !isSelf &&
    myCoachState === "active" &&
    Number(myCoachId) === Number(coach.user_id);

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
      if (myCoachState === "active") return "Coach Already Hired";
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
                    {coach.Coach?.is_approved && (
                      <span className="cp-verified">✓ Verified</span>
                    )}
                  </h1>
                  <p className="cp-subtitle">
                    {coach.Coach?.specialization || "General Coaching"} · Coach
                  </p>
                </div>
                <div className="cp-btn-header">
                  {headerButton}
                  {canReview && (
                    <button
                      className="cp-fire-btn"
                      onClick={() => setShowFireConfirm(true)}
                    >
                      Fire Coach
                    </button>
                  )}
                  {canReview && (
                    <button
                      className="cp-report-btn"
                      onClick={() => setShowReportForm((prev) => !prev)}
                    >
                      Report Coach
                    </button>
                  )}
                </div>
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
                    {coach.Coach?.is_approved ? "Yes" : "No"}
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
                <option value="unprofessional_behavior">
                  Unprofessional Behavior
                </option>
                <option value="non_compliance">Non Compliance</option>
                <option value="communication_issues">
                  Communication Issues
                </option>
                <option value="quality_of_service">Quality of Service</option>
                <option value="billing_dispute">Billing Dispute</option>
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
          {[
            "about",
            "packages",
            "reviews",
            "certifications",
            ...(myCoachState === "active" ? ["workouts"] : []),
          ].map((tab) => (
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

            {/* Session Packages */}
            <div className="cp-section-header">
              <h3>Session Packages</h3>
              <p>One-off or bundled sessions at the coach's hourly rate.</p>
            </div>

            {activePurchase && activePurchase.sessions_remaining > 0 && (
              <div className="cp-active-purchase-banner">
                <span>
                  ✓ You have{" "}
                  <strong>{activePurchase.sessions_remaining}</strong> session
                  {activePurchase.sessions_remaining === 1 ? "" : "s"} remaining
                  with {coach.first_name}
                </span>
                <button
                  className="cp-program-btn"
                  onClick={() => navigate(`/book-session/${id}`)}
                >
                  Book a Session →
                </button>
              </div>
            )}

            {packagesLoading ? (
              <div className="cp-card cp-empty">
                <p>Loading packages...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="cp-card cp-empty">
                <div className="cp-empty-icon">📦</div>
                <h3>No packages available</h3>
                <p>
                  {coach.first_name} hasn't published any session packages yet.
                </p>
              </div>
            ) : (
              <div className="cp-programs-grid">
                {packages.map((pkg, i) => (
                  <div
                    key={pkg.package_id}
                    className={`cp-program-card ${i === 1 ? "featured" : ""}`}
                  >
                    {i === 1 && (
                      <div className="cp-program-badge">Most Popular</div>
                    )}
                    <h4 className="cp-program-title">{pkg.name}</h4>
                    <div className="cp-program-price">
                      <span className="cp-program-currency">$</span>
                      {pkg.final_price !== null
                        ? Number(pkg.final_price).toFixed(0)
                        : "—"}
                      <span className="cp-program-period">
                        / {pkg.session_count} session
                        {pkg.session_count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="cp-program-desc">
                      {pkg.session_count} × ${pkg.hourly_rate}/hr
                      {Number(pkg.discount_percent) > 0 &&
                        ` − ${pkg.discount_percent}% off`}
                    </p>
                    <button
                      className="cp-program-btn"
                      disabled={!canSubscribe}
                      onClick={() => canSubscribe && setSelectedPackage(pkg)}
                    >
                      {!canSubscribe
                        ? activeRole === "coach"
                          ? "Coaches can't subscribe"
                          : "Sign in as client"
                        : "Purchase"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div className="cp-card">
            <h3 className="cp-card-title">Client Reviews</h3>
            {canReview && (
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

        {/*assigned workouts to client tab */}
        {activeTab === "workouts" && myCoachState === "active" && (
          <div className="cp-card">
            <h3 className="cp-card-title">Proposed Workout Plans</h3>
            {assignedLoading ? (
              <p>Loading</p>
            ) : assignedWorkouts.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">📋</div>
                <p>No proposed workouts from your coach yet.</p>
              </div>
            ) : (
              assignedWorkouts.map((w) =>
                declineTarget === w.assigned_workout_id ? (
                  <div key={w.assigned_workout_id} className="cp-assigned-card">
                    <h4 className="cp-assigned-title">
                      Why are you declining "{w.Workout?.title}"?
                    </h4>
                    <textarea
                      className="cp-decline-input"
                      placeholder="Let your coach know why this plan doesn't work for you..."
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      rows={4}
                    />
                    <div className="cp-assigned-actions">
                      <button
                        className="cp-btn cp-btn-primary"
                        disabled={!declineReason.trim() || responding}
                        onClick={() =>
                          handleDeclineSubmit(w.assigned_workout_id)
                        }
                      >
                        {responding ? "Submitting..." : "Submit"}
                      </button>
                      <button
                        className="cp-btn cp-btn-ghost"
                        onClick={() => {
                          setDeclineTarget(null);
                          setDeclineReason("");
                        }}
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={w.assigned_workout_id} className="cp-assigned-card">
                    <div className="cp-assigned-header">
                      <div className="cp-assigned-header container">
                        <span className="cp-assigned-title">
                          {w.Workout?.title}
                        </span>
                        {w.due_date && (
                          <p className="cp-assigned-due">
                            📅 Due: {w.due_date}
                          </p>
                        )}
                      </div>
                      <span className={`cp-assigned-status ${w.status === "accepted" ? "accepted" : ""}`}>
                        {w.status === "accepted" ? "✓ Accepted" : w.status}
                      </span>
                    </div>
                    {w.coach_notes && (
                      <p className="cp-assigned-notes">📝 {w.coach_notes}</p>
                    )}
                    {w.status !== "accepted" && (
                    <div className="cp-assigned-actions">
                      <button
                        className="cp-btn cp-btn-primary"
                        disabled={responding}
                        onClick={() =>
                          handleAssignmentAccept(w.assigned_workout_id)
                        }
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="cp-btn cp-btn-ghost"
                        onClick={() => setDeclineTarget(w.assigned_workout_id)}
                      >
                        ✕ Decline
                      </button>
                    </div>
                    )}
                  </div>
                )
              )
            )}
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

      {/* Package purchase modal */}
      {selectedPackage && (
        <div
          className="cp-modal-overlay"
          onClick={() => !purchasing && setSelectedPackage(null)}
        >
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="cp-modal-close"
              onClick={() => setSelectedPackage(null)}
            >
              ✕
            </button>
            <h3 className="cp-modal-title">Confirm Purchase</h3>
            <div className="cp-modal-plan-name">{selectedPackage.name}</div>
            <div className="cp-modal-details">
              <div className="cp-modal-row">
                <span>Sessions</span>
                <strong>{selectedPackage.session_count}</strong>
              </div>
              <div className="cp-modal-row">
                <span>Per session</span>
                <strong>
                  ${Number(selectedPackage.hourly_rate).toFixed(2)}
                </strong>
              </div>
              {Number(selectedPackage.discount_percent) > 0 && (
                <div className="cp-modal-row">
                  <span>Discount</span>
                  <strong>−{selectedPackage.discount_percent}%</strong>
                </div>
              )}
              <div className="cp-modal-row">
                <span>Total</span>
                <strong>
                  ${Number(selectedPackage.final_price).toFixed(2)} USD
                </strong>
              </div>
              <div className="cp-modal-row">
                <span>Coach</span>
                <strong>
                  {coach.first_name} {coach.last_name}
                </strong>
              </div>
            </div>
            <button
              className="cp-modal-confirm-btn"
              onClick={handlePurchasePackage}
              disabled={purchasing}
            >
              {purchasing ? "Processing..." : "Confirm Payment"}
            </button>
            <p className="cp-modal-disclaimer">
              This is a simulated payment. No real charge will be made.
            </p>
          </div>
        </div>
      )}
      {showFireConfirm && (
        <div
          className="cp-modal-overlay"
          onClick={() => setShowFireConfirm(false)}
        >
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="cp-modal-close"
              onClick={() => setShowFireConfirm(false)}
            >
              ✕
            </button>
            <h3 className="cp-modal-title">Fire Coach?</h3>
            <p className="cp-modal-desc">
              Are you sure you want to fire {coach.first_name} {coach.last_name}
              ? This will end your coaching relationship and cancel all active
              payments.
            </p>
            <div className="cp-modal-actions">
              <button
                className="cp-modal-confirm-btn"
                onClick={handleUnhireCoach}
              >
                Yes, Fire Coach
              </button>
              <button
                className="cp-btn cp-btn-ghost"
                onClick={() => setShowFireConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFireSuccess && (
        <div
          className="cp-modal-overlay"
          onClick={() => setShowFireSuccess(false)}
        >
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="cp-modal-close"
              onClick={() => setShowFireSuccess(false)}
            >
              ✕
            </button>
            <h3 className="cp-modal-title">Termination Successful</h3>
            <p className="cp-modal-desc">
              Your coaching relationship with {coach.first_name}{" "}
              {coach.last_name}
              has been ended. All payments toward this coach have been canceled.
            </p>
            <button
              className="cp-modal-confirm-btn"
              onClick={() => setShowFireSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {responseModal && (
        <div className="cp-modal-overlay" onClick={() => setResponseModal(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <button
            className="cp-modal-close"
            onClick={() => setResponseModal(null)}
          >
            ✕
            </button>
            <h3 className="cp-modal-title">
              {responseModal.type === "accepted"
                ? "Workout Accepted ✓"
                : "Workout Declined"}
            </h3>
            <p className="cp-modal-desc">
              {responseModal.type === "accepted"
                ? `"${responseModal.title}" has been added to your plan and your coach has been notified.`
                : `"${responseModal.title}" was declined. Your coach has been notified with your feedback.`}
            </p>
            <button
              className="cp-modal-confirm-btn"
              onClick={() => setResponseModal(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoachDetail;
