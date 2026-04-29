import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { WorkoutContext } from "../context/WorkoutContext";
import "../styles/ActiveWorkout.css";
import { useMemo } from "react";

function ActiveWorkout() {
  const submittedRef = useRef(false);
  const navigate = useNavigate();
  const { activeWorkout, setActiveWorkout } = useContext(WorkoutContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState("exercise");
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime] = useState(() => Date.now());

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
    if (!done || submittedRef.current || !activeWorkout) return;
    submittedRef.current = true;
    console.log("DEBUG done effect", {
      activeWorkoutId: activeWorkout?.id,
      assignmentId: activeWorkout?.assignmentId,
      exerciseCount: exercises.length,
      exerciseIds: exercises.map((e) => e.exercise_id),
    });

    // Keep localStorage for now (other parts of dashboard read it)
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

    // Backend integration — works for both assigned AND self-started workouts
    if (activeWorkout.id && exercises.length > 0) {
      const token = localStorage.getItem("token");

      const strengthLogs = exercises
        .filter((ex) => ex.exercise_id)
        .map((ex) => ({
          exercise_id: ex.exercise_id,
          sets: Number(ex.sets) || 0,
          reps: Number(ex.reps) || 0,
          weight_lbs: ex.weight ? Number(ex.weight) : null,
        }));

      const elapsedMs = Date.now() - startTime;
      const durationMinutes = Math.max(1, Math.round(elapsedMs / 60000));

      // 1. Always log the workout to DB
      if (strengthLogs.length > 0) {
        fetch("http://localhost:4000/api/logs/workout-log", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workout_id: activeWorkout.id,
            date: new Date().toISOString().split("T")[0],
            duration_minutes: durationMinutes,
            notes: null,
            strengthLogs,
            cardioLogs: [],
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.json();
              console.error("Workout log POST failed:", res.status, err);
            } else {
              console.log("✓ Workout log saved to DB");
            }
          })
          .catch((err) => console.error("Workout log network error:", err));
      }

      // 2. Only mark assignment complete if this came from a coach assignment
      if (activeWorkout.assignmentId) {
        fetch(
          `http://localhost:4000/api/client/assignments/${activeWorkout.assignmentId}/complete`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch((err) =>
          console.error("Failed to mark assignment complete:", err)
        );
      }
    }

  }, [done, activeWorkout, exercises, startTime]);

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
    const wasAssignment = activeWorkout?.assignmentId;
    setActiveWorkout(null);
    navigate(wasAssignment ? "/dashboard" : "/workouts/premade");
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
