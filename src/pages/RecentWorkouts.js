import React, { useEffect, useState } from "react";
import "../styles/RecentWorkouts.css";

function RecentWorkouts() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const savedWorkouts =
      JSON.parse(localStorage.getItem("loggedWorkouts")) || [];
    setWorkouts([...savedWorkouts].reverse());
  }, []);

  return (
    <div className="recent-workouts-page">
      <div className="recent-workouts-title">Recent Workouts</div>

      <div className="recent-workouts-container">
        {workouts.length === 0 ? (
          <div className="recent-workouts-empty">
            No workouts have been logged yet.
          </div>
        ) : (
          workouts.map((workout, index) => (
            <div className="recent-workout-card" key={index}>
              <div className="recent-workout-content">
                <div className="recent-workout-name">{workout.workoutType}</div>

                <div className="recent-workout-minutes">
                  {workout.duration} Minutes
                </div>

                <div className="recent-workout-details">
                  <span className="recent-workout-sets">
                    {workout.sets} Sets
                  </span>
                  <span className="recent-workout-divider">|</span>
                  <span className="recent-workout-reps">
                    {workout.reps} Reps
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentWorkouts;