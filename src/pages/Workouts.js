import { useNavigate } from "react-router-dom";
import "../styles/Workouts.css";

function Workouts() {
  const navigate = useNavigate();

  return (
    <div className="workouts-page">
      <div className="workout-toggle-row">
        <button
          className="workout-toggle-btn"
          onClick={() => navigate("/workouts/premade")}
        >
          Premade Workouts
        </button>
        <button
          className="workout-toggle-btn"
          onClick={() => navigate("/workouts/custom")}
        >
          Custom
        </button>
      </div>
    </div>
  );
}

export default Workouts;
