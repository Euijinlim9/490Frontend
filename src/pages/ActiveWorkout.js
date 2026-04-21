import React, { useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { WorkoutContext } from "../context/WorkoutContext";
import "../styles/ActiveWorkout.css";
import { useMemo } from "react";

function ActiveWorkout() {
  const navigate = useNavigate();
  const { activeWorkout, setActiveWorkout } = useContext(WorkoutContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState("exercise");
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [workoutLogged, setWorkoutLogged] = useState(false);

  const exercises = useMemo(() => {
    return activeWorkout?.exercises || [];
  }, [activeWorkout]);
  const current = exercises[currentIndex];
  const totalSets = Number(current?.sets) || 1;

  const goNextExercise = useCallback(() => {
    if (currentIndex + 1 >= exercises.length) {
      setDone(true);
      setRunning(false);
    } else {
      setCurrentIndex((i) => i + 1);
      setCurrentSet(1);
      setPhase("exercise");
      setRunning(false);
      setTimer(0);
    }
  }, [currentIndex, exercises.length]);

  useEffect(() => {
    if (!running || timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [running, timer]);

  useEffect(() => {
    if (phase === "rest" && running && timer === 0) {
      if (currentSet < totalSets) {
        setCurrentSet((s) => s + 1);
        setPhase("exercise");
        setRunning(false);
        setTimer(0);
      } else {
        goNextExercise();
      }
    }
  }, [phase, running, timer, currentSet, totalSets, goNextExercise]);

  useEffect(() => {
    if (!done || workoutLogged || !activeWorkout) return;

    const workoutLog = {
      workoutType: activeWorkout.name,
      duration:
        exercises.reduce(
          (total, ex) =>
            total + (Number(ex.breakTime) || 0) * (Number(ex.sets) || 1),
          0
        ) / 60,
      sets: exercises.reduce((total, ex) => total + (Number(ex.sets) || 0), 0),
      reps: exercises.reduce(
        (total, ex) => total + (Number(ex.sets) || 0) * (Number(ex.reps) || 0),
        0
      ),
      date: new Date().toLocaleDateString(),
    };

    const existingWorkouts =
      JSON.parse(localStorage.getItem("loggedWorkouts")) || [];

    localStorage.setItem(
      "loggedWorkouts",
      JSON.stringify([...existingWorkouts, workoutLog])
    );

    setWorkoutLogged(true);
  }, [done, workoutLogged, activeWorkout, exercises]);

  const handleDoneSet = () => {
    if (currentSet < totalSets) {
      setPhase("rest");
      setTimer(current.breakTime || 60);
      setRunning(true);
    } else {
      goNextExercise();
    }
  };

  const handleSkipRest = () => {
    setCurrentSet((s) => s + 1);
    setPhase("exercise");
    setRunning(false);
    setTimer(0);
  };

  const handleFinishWorkout = () => {
    setActiveWorkout(null);
    navigate("/workouts/premade");
  };

  if (!activeWorkout) {
    navigate("/workouts/premade");
    return null;
  }

  if (done) {
    return (
      <div className="aw-page">
        <div className="aw-done-box">
          <span className="aw-done-icon">🎉</span>
          <h2>Workout Complete!</h2>
          <p>{activeWorkout.name}</p>
          <button className="aw-btn-primary" onClick={handleFinishWorkout}>
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="aw-page">
      <div className="aw-topbar">
        <button className="aw-back-btn" onClick={handleFinishWorkout}>
          ✕ Quit
        </button>
        <span className="aw-workout-name">{activeWorkout.name}</span>
        <span className="aw-progress">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="aw-progress-bar">
        <div
          className="aw-progress-fill"
          style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
        />
      </div>

      {phase === "exercise" ? (
        <div className="aw-card">
          <span className="aw-phase-label">
            Set {currentSet} of {totalSets}
          </span>
          <h2 className="aw-ex-name">{current.name}</h2>
          <div className="aw-ex-stats">
            <div className="aw-stat">
              <span className="aw-stat-val">{current.sets}</span>
              <span className="aw-stat-label">Sets</span>
            </div>
            <div className="aw-stat">
              <span className="aw-stat-val">{current.reps}</span>
              <span className="aw-stat-label">Reps</span>
            </div>
            {current.weight && (
              <div className="aw-stat">
                <span className="aw-stat-val">{current.weight}lbs</span>
                <span className="aw-stat-label">Weight</span>
              </div>
            )}
          </div>
          <button className="aw-btn-primary" onClick={handleDoneSet}>
            {currentSet < totalSets
              ? `Done Set ${currentSet} — Rest`
              : "Done — Next Exercise"}
          </button>
        </div>
      ) : (
        <div className="aw-card">
          <span className="aw-phase-label aw-rest-label">Rest</span>
          <h2 className="aw-timer">{timer}s</h2>
          <p className="aw-rest-next">
            Set {currentSet} of {totalSets} — Up next:{" "}
            {currentSet < totalSets
              ? `Set ${currentSet + 1}`
              : exercises[currentIndex + 1]?.name || "Finish"}
          </p>
          <button className="aw-btn-secondary" onClick={handleSkipRest}>
            Skip Rest
          </button>
        </div>
      )}

      <div className="aw-exercise-queue">
        {exercises.map((ex, i) => (
          <div
            key={i}
            className={`aw-queue-item ${i === currentIndex ? "active" : ""} ${
              i < currentIndex ? "done" : ""
            }`}
          >
            <span className="aw-queue-num">{i + 1}</span>
            <span className="aw-queue-name">{ex.name}</span>
            {i < currentIndex && <span className="aw-queue-check">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActiveWorkout;
