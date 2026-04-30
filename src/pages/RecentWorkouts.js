import React, { useEffect, useState } from "react";
import "../styles/RecentWorkouts.css";

function RecentWorkouts() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const savedWorkouts =
      JSON.parse(localStorage.getItem("loggedWorkouts")) || [];

    setWorkouts([...savedWorkouts].reverse());
  }, []);

  const handleDeleteWorkout = (indexToDelete) => {
    const updatedWorkouts = workouts.filter(
      (_, index) => index !== indexToDelete
    );

    setWorkouts(updatedWorkouts);

    localStorage.setItem(
      "loggedWorkouts",
      JSON.stringify([...updatedWorkouts].reverse())
    );
  };

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
              <button
                className="delete-log-btn"
                onClick={() => handleDeleteWorkout(index)}
              >
                Delete
              </button>

              <div className="recent-workout-content">
                <div className="recent-workout-name">
                  {workout.workoutType || "Workout"}
                </div>

                <div className="recent-workout-minutes">
                  {workout.duration || workout.time || 0} Minutes
                </div>

                <div className="recent-workout-details">
                  {workout.sets && <span>{workout.sets} Sets</span>}

                  {workout.reps && (
                    <>
                      {workout.sets && (
                        <span className="recent-workout-divider">|</span>
                      )}
                      <span>{workout.reps} Reps</span>
                    </>
                  )}

                  {workout.incline && (
                      <span>Incline: {workout.incline}</span>
                  )}

                  {workout.speed && (
                    <>
                      <span className="recent-workout-divider">|</span>
                      <span>Speed: {workout.speed} mph</span>
                    </>
                  )}

                  {workout.distance && (
                    <>
                      <span className="recent-workout-divider">|</span>
                      <span>Distance: {workout.distance} mi</span>
                    </>
                  )}
                </div>

                {workout.date && (
                  <div className="recent-workout-date">{workout.date}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentWorkouts;