import React from "react";
import { useParams, Link } from "react-router-dom";
import userimg from "../images/user.svg";
import { coachData } from "../pages/Coach.js";
import "../styles/CoachDetail.css";

function CoachDetail() {
  const { id } = useParams();
  
  const coach = coachData.find((c) => c.id === parseInt(id));

  if (!coach) {
    return <h2>Coach not found</h2>;
  }

  return (
    <div className = "coach-detail-page">

    <div className="button-container">
        <Link to="/coach" className="back-button">
        <h3>Back</h3>
        </Link>
        <button>Coach Information</button>
        <button>Packages</button>
        <button>Reviews</button>
    </div>

    <div className="coach-container2">
        <div className="coach-image">
            <img src={userimg} alt={coach.firstName} />
        </div>
        <div className="coach-info">
            <h2>{coach.firstName} {coach.lastName}</h2>
            <h4>No Reviews Yet</h4>
            <p>{coach.bio}</p>
            <div className="line"></div>
            <p><strong>Specialty:</strong></p>
            <p>{coach.specialty}</p>
            <div className="line"></div>
        </div>
    </div>
    </div>
  );
}

export default CoachDetail;