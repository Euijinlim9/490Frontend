import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkoutContext } from "../context/WorkoutContext";
import "../styles/PremadeWorkouts.css";

function PremadeWorkouts() {
  const navigate = useNavigate();
  const { setActiveWorkout } = useContext(WorkoutContext);
  const [createdWorkouts, setCreatedWorkouts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:4000/api/workout/premade", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setCreatedWorkouts(data.data || []);
        setCurrentPage(data.currentPage || 1);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWorkouts();
  }, [currentPage]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4000/api/workout/premade/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setCreatedWorkouts((prev) => prev.filter((w) => w.workout_id !== id));

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  const startWorkout = (e, workout) => {
    e.stopPropagation();
    setActiveWorkout(workout);
    navigate("/workouts/active");
  };

  const myWorkouts = createdWorkouts.map((w) => ({
    id: w.workout_id,
    name: w.title,
    isPublic: true,
    estimated_minutes: w.estimated_minutes,
    exercises: (w.Exercises || []).map((ex) => ({
        exercise_id: ex.exercise_id,
        name: ex.name,
        sets: ex.workout_exercise?.sets,
        reps: ex.workout_exercise?.reps,
        breakTime: ex.workout_exercise?.rest_seconds || 10,
      })),
  }));

  const ExerciseList = ({ exercises }) => (
    <div className="pw-exercise-list" onClick={(e) => e.stopPropagation()}>
      {exercises.map((ex, i) => (
        <div key={i} className="pw-exercise-item">
          <div className="pw-ex-row">
            <span className="pw-ex-name">{ex.name}</span>
            {ex.youtubeUrl && (
              <a
                className="pw-yt-link"
                href={ex.youtubeUrl}
                target="_blank"
                rel="noreferrer"
              >
                ▶ Watch
              </a>
            )}
          </div>
          <span className="pw-ex-meta">
            {ex.sets} sets · {ex.reps} reps · {ex.breakTime}s rest
          </span>
        </div>
      ))}
    </div>
  );

  const WorkoutCard = ({ workout }) => (
    <div className="pw-card">
      <div className="pw-card-header">
        <span className="pw-card-name">{workout.name}</span>
        {workout.isPublic && <span className="pw-public-badge">Public</span>}
        <button className="pw-delete-btn" onClick={() => setDeleteTarget(workout.id)}>Delete</button>
      </div>
      <span className="pw-card-meta">{workout.exercises.length} exercises</span>
      <ExerciseList exercises={workout.exercises} />
      <button className="pw-start-btn" onClick={(e) => startWorkout(e, workout)}>▶ Start Workout</button>
    </div>
  );

  return (
    <div className="premade-workouts-page">
      <div className="pw-topbar">
        <button className="pw-back-btn" onClick={() => navigate("/workouts")}>
          ← Back
        </button>
        <h2 className="pw-title">Premade Workouts</h2>
      </div>

      <div className="pw-layout">
        <div className="pw-section">
          <h3 className="pw-section-title">My Workouts</h3>
          {myWorkouts.length === 0 ? (
            <p className="pw-empty">
              No workouts yet. Create one from the Custom page!
            </p>
          ) : (
            <div className="pw-cards">
              {myWorkouts.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          )}
        </div>
      </div>
      {deleteTarget && (
        <div className="delete-modal-backdrop">
          <div className="delete-modal">
            <h3>Delete workout?</h3>
            <p>This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="cancel-delete-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="delete-btn" onClick={() => handleDelete(deleteTarget)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PremadeWorkouts;
