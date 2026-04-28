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

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("");

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
        console.error(err);
        setError("Could not load coach. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
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
      } catch (err) {
        console.error(err);
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
    if (!window.confirm(`Send a coaching request to ${coach.first_name}?`)) {
      return;
    }

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
    } catch (err) {
      console.error(err);
      alert("Could not send request. Please try again.");
    } finally {
      setRequesting(false);
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

    localStorage.setItem(
      `coachReviews-${id}`,
      JSON.stringify(updatedReviews)
    );

    setReviews(updatedReviews);
    setReviewText("");
    setReviewRating("");
  };

  if (loading) {
    return (
      <div className="cp-page">
        <div className="cp-status">Loading...</div>
      </div>
    );
  }

  if (error || !coach) {
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
  }

  const isSelf = user && coach && user.user_id === coach.user_id;

  const canRequest =
    activeRole === "client" && myCoachState === "none" && !isSelf;

  const requestButtonLabel = (() => {
    if (isSelf) return "This is your profile";
    if (activeRole !== "client") return "Only clients can request";
    if (myCoachState === "pending") return "Request Pending";
    if (myCoachState === "active") return "You already have a coach";
    if (requesting) return "Sending...";
    return "Request this Coach";
  })();

  const placeholderPrograms = [
    {
      duration: "1 Month",
      price: 149,
      features: ["Custom workout plan", "Weekly check-ins", "Chat support"],
    },
    {
      duration: "3 Months",
      price: 399,
      features: [
        "Custom workout plan",
        "Weekly check-ins",
        "Chat support",
        "Nutrition guidance",
      ],
      featured: true,
    },
    {
      duration: "6 Months",
      price: 699,
      features: [
        "Everything in 3 Months",
        "Bi-weekly video calls",
        "Progress tracking dashboard",
      ],
    },
  ];

  const hourlyRate = coach.Coach?.price || 50;

  return (
    <div className="cp-page">
      <Link to="/coach" className="cp-back">
        ← Back
      </Link>

      <div className="cp-container">
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

                <button
                  className="cp-request-btn"
                  onClick={handleRequest}
                  disabled={!canRequest || requesting}
                >
                  {requestButtonLabel}
                </button>
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

        <div className="cp-tabs">
          <button
            className={`cp-tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>

          <button
            className={`cp-tab ${activeTab === "packages" ? "active" : ""}`}
            onClick={() => setActiveTab("packages")}
          >
            Packages
          </button>

          <button
            className={`cp-tab ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>

          <button
            className={`cp-tab ${
              activeTab === "certifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("certifications")}
          >
            Certifications
          </button>
        </div>

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

        {activeTab === "packages" && (
          <>
            <div className="cp-section-header">
              <h3>Online Programs</h3>
              <p>Structured coaching programs with clear milestones.</p>
            </div>

            <div className="cp-programs-grid">
              {placeholderPrograms.map((program) => (
                <div
                  key={program.duration}
                  className={`cp-program-card ${
                    program.featured ? "featured" : ""
                  }`}
                >
                  {program.featured && (
                    <div className="cp-program-badge">Most Popular</div>
                  )}

                  <h4 className="cp-program-title">{program.duration}</h4>

                  <div className="cp-program-price">
                    <span className="cp-program-currency">$</span>
                    {program.price}
                    <span className="cp-program-period">total</span>
                  </div>

                  <ul className="cp-program-features">
                    {program.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>

                  <button
                    className="cp-program-btn"
                    disabled={!canRequest}
                    onClick={handleRequest}
                  >
                    Select Program
                  </button>
                </div>
              ))}
            </div>

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

              <button
                className="cp-booking-btn"
                disabled={!canRequest}
                onClick={handleRequest}
              >
                Book a Session
              </button>
            </div>
          </>
        )}

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
    </div>
  );
}

export default CoachDetail;
