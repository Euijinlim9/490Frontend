import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CustomWorkout.css";
import { WorkoutContext } from "../context/WorkoutContext";

const emptyForm = () => ({
  name: "",
  youtubeUrl: "",
  sets: "",
  reps: "",
  notes: "",
  breakTime: "",
});

function CustomWorkout() {
  const navigate = useNavigate();
  useContext(WorkoutContext);

  const [workoutName, setWorkoutName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [form, setForm] = useState(emptyForm());
  const [addedExercises, setAddedExercises] = useState([]);
  const [nameError, setNameError] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState(false);
  const [filter, setFilter] = useState({
    muscle: "",
    equipment: "",
  });
  const [appliedFilter, setAppliedFilter] = useState({
    muscle: "",
    equipment: "",
  });
  const [selectedDays, setSelectedDays] = useState([]);
  const [scheduleWeeks, setScheduleWeeks] = useState(4);

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (i) => {
    setSelectedDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
    );
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const param = new URLSearchParams({
          muscle: appliedFilter.muscle,
          equipment: appliedFilter.equipment,
          page: currentPage,
        });

        const res = await fetch(
          `http://localhost:4000/api/workout/custom?${param.toString()}`
        );

        const data = await res.json();

        setExercises(data.data || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExercises();
  }, [currentPage, appliedFilter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const pageSearch = () => {
    setCurrentPage(1);
    setAppliedFilter(filter);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustom = () => {
    if (!form.name || !form.sets || !form.reps || !form.breakTime) {
      setFormError(true);
      return;
    }

    setFormError(false);

    setAddedExercises((prev) => [...prev, { ...form }]);
    setForm(emptyForm());
  };

  const handleAddCommon = (exercise) => {
    const alreadyAdded = addedExercises.some((ex) => ex.name === exercise.name);
    if (alreadyAdded) return;
    setAddedExercises((prev) => [
      ...prev,
      {
        exercise_id: exercise.exercise_id,
        name: exercise.name,
        category: exercise.category,
        equipment: exercise.equipment,
        instructions: exercise.instructions,
        youtubeUrl: exercise.video_url,
        primary_muscle: exercise.pirmary_muscle,
        imageUrl: exercise.image_url,
      },
    ]);
  };

  const handleRemove = (index) => {
    setAddedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditExercise = (index, field, value) => {
    setAddedExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const handleFinish = async () => {
    if (!workoutName || !estimatedMinutes) {
      setNameError(true);
      setFormError(true);
      return;
    }
    if (addedExercises.length === 0) return;

    for (let ex of addedExercises) {
      if (!ex.sets || !ex.reps || !ex.breakTime) {
        alert("All exercises must have sets, reps, and rest.");
        return;
      }
    }

    const formattedExercises = addedExercises.map((ex) => ({
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.breakTime,
      notes: ex.notes,
    }));

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/api/workout/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: workoutName,
          description: description,
          estimated_minutes: parseInt(estimatedMinutes),
          exercises: formattedExercises,
        }),
      });

      const data = await res.json();

      setWorkoutName("");
      setAddedExercises([]);
      setNameError(false);
      setFormError(false);
      setShowSaved(true);
      setEstimatedMinutes("");
      setDescription("");
      setTimeout(() => setShowSaved(false), 2500);

      if (selectedDays.length > 0) {
        const today = new Date();
        const token2 = localStorage.getItem("token");
        const dates = [];
        for (let week = 0; week < scheduleWeeks; week++) {
          selectedDays.forEach((dayIndex) => {
            const d = new Date(today);
            const diff = (dayIndex - today.getDay() + 7) % 7 + week * 7;
            d.setDate(today.getDate() + diff);
            dates.push(d.toISOString().split("T")[0]);
          });
        }
        await Promise.all(
          dates.map((dateStr) =>
            fetch("http://localhost:4000/api/calendar", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token2}` },
              body: JSON.stringify({ date: dateStr, text: workoutName, color: "#7ed87e" }),
            })
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="custom-workout-page">
      {showSaved && <div className="cw-saved-toast">✓ Workout Saved!</div>}

      <div className="cw-topbar">
        <button className="cw-back-btn" onClick={() => navigate("/workouts")}>
          ← Back
        </button>
        <h2 className="cw-title">Custom Workout</h2>
      </div>

      <div className="cw-workout-meta">
        <div className="cw-meta-name-row">
          <div className="cw-meta-left">
            <label className="cw-meta-label">Workout Name</label>
            <input
              className={`cw-meta-input ${nameError ? "cw-input-error" : ""}`}
              type="text"
              placeholder="e.g. Morning Push Day"
              value={workoutName}
              onChange={(e) => {
                setWorkoutName(e.target.value);
                setNameError(false);
              }}
            />

            <div className="cw-meta-extra">
              <div className="cw-form-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="e.g Back + Bicep Focus"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="cw-form-dropdown">
                <label>Estimated Time (Minutes)</label>
                <select
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                >
                  <option value="">Select Time</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>

              <div className="cw-schedule-row">
                <div className="cw-schedule-header">
                  <span className="cw-meta-label">Schedule Days</span>
                </div>
                <div className="cw-days-row">
                  {DAYS.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`cw-day-btn ${selectedDays.includes(i) ? "selected" : ""}`}
                      onClick={() => toggleDay(i)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="cw-weeks-row">
                  <span className="cw-meta-label">Repeat for</span>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={scheduleWeeks}
                    onChange={(e) => setScheduleWeeks(Math.max(1, parseInt(e.target.value) || 1))}
                    className="cw-weeks-input"
                  />
                  <span className="cw-meta-label">weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {addedExercises.length > 0 && (
          <div className="cw-added-list">
            <h3 className="cw-section-title">Your Exercises</h3>
            {addedExercises.map((ex, i) => (
              <div key={i} className="cw-added-item">
                <div className="cw-added-info">
                  <span className="cw-added-name">{ex.name}</span>
                  {ex.youtubeUrl && (
                    <a
                      href={ex.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cw-yt-link"
                    >
                      Watch on YouTube
                    </a>
                  )}
                  <div className="cw-added-edit-row">
                    <div className="cw-added-edit-group">
                      <label>Sets</label>
                      <input
                        type="number"
                        min="1"
                        className={
                          formError && !ex.sets ? "dw-input-error" : ""
                        }
                        value={ex.sets}
                        onChange={(e) =>
                          handleEditExercise(i, "sets", e.target.value)
                        }
                      />
                    </div>
                    <div className="cw-added-edit-group">
                      <label>Reps</label>
                      <input
                        type="number"
                        min="1"
                        className={
                          formError && !ex.reps ? "dw-input-error" : ""
                        }
                        value={ex.reps}
                        onChange={(e) =>
                          handleEditExercise(i, "reps", e.target.value)
                        }
                      />
                    </div>
                    <div className="cw-added-edit-group">
                      <label>Rest (s)</label>
                      <input
                        type="number"
                        min="0"
                        className={
                          formError && !ex.breakTime ? "dw-input-error" : ""
                        }
                        value={ex.breakTime}
                        onChange={(e) =>
                          handleEditExercise(i, "breakTime", e.target.value)
                        }
                      />
                    </div>
                    <div className="cw-added-edit-group">
                      <label>Notes</label>
                      <input
                        name="notes"
                        type="text"
                        placeholder="input weight, time, etc."
                        value={ex.notes}
                        onChange={(e) =>
                          handleEditExercise(i, "notes", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="cw-remove-btn"
                  onClick={() => handleRemove(i)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button className="cw-finish-btn" onClick={handleFinish}>
              Finished
            </button>
          </div>
        )}
      </div>

      <div className="cw-layout">
        <div className="cw-right">
          <h3 className="cw-section-title">Exercise Catalog</h3>

          <div className="search-overlay">
            <label htmlFor="muscle">Muscle Group:</label>
            <select name="muscle" id="muscle" onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="triceps">Triceps</option>
              <option value="biceps">Biceps</option>
              <option value="abs">Abs</option>
              <option value="chest">Chest</option>
              <option value="back">Back</option>
              <option value="core">Core</option>
              <option value="glutes">Glutes</option>
              <option value="shoulders">Shoulders</option>
              <option value="full body">Full Body</option>
            </select>

            <label htmlFor="equipment">Equipment:</label>
            <select
              name="equipment"
              id="equipment"
              onChange={handleFilterChange}
            >
              <option value="">Any</option>
              <option value="dumbbell">Dumbell</option>
              <option value="barbell">Barbell</option>
              <option value="cable">Cable Machine</option>
              <option value="none">No Equipment</option>
              <option value="ball">Ball</option>
              <option value="machine">Machine</option>
            </select>

            <button onClick={pageSearch}>Search</button>
          </div>
          <div className="cw-cards-grid">
            {exercises.length === 0 ? (
              <p className="cw-no-results">No exercises found.</p>
            ) : (
              exercises.map((ex, i) => {
                const added = addedExercises.some((a) => a.name === ex.name);
                return (
                  <div
                    key={i}
                    className={`cw-exercise-card ${
                      added ? "cw-card-added" : ""
                    }`}
                  >
                    <a href={ex.video_url}>
                      <img
                        src={ex.image_url}
                        alt={ex.name}
                        className="cw-card-thumbnail"
                      />
                    </a>
                    <div className="cw-card-info">
                      <span className="cw-card-name">{ex.name}</span>
                      <span className="cw-card-muscle">
                        {ex.pirmary_muscle}
                      </span>
                      <span className="cw-card-meta">
                        {" "}
                        Category: {ex.category} · Equipment: {ex.equipment}{" "}
                      </span>
                    </div>
                    <button
                      className="cw-card-add-btn"
                      onClick={() => handleAddCommon(ex)}
                      disabled={added}
                    >
                      {added ? "Added" : "+ Add"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className="page-template">
            <button
              className="page-button"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="counter">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="page-button"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        <div className="cw-left">
          <h3 className="cw-section-title">Add Exercise</h3>

          <div className="cw-form">
            <div className="cw-form-group">
              <label>Exercise Name</label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Cable Fly"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="cw-form-group">
              <label>YouTube Link</label>
              <input
                name="youtubeUrl"
                type="text"
                placeholder="https://youtube.com/..."
                value={form.youtubeUrl}
                onChange={handleChange}
              />
            </div>

            <div className="cw-form-row">
              <div className="cw-form-group">
                <label>Sets</label>
                <input
                  name="sets"
                  type="number"
                  placeholder="3"
                  min="1"
                  value={form.sets}
                  onChange={handleChange}
                />
              </div>
              <div className="cw-form-group">
                <label>Reps</label>
                <input
                  name="reps"
                  type="number"
                  placeholder="10"
                  min="1"
                  value={form.reps}
                  onChange={handleChange}
                />
              </div>
              <div className="cw-form-group">
                <label>Rest (sec)</label>
                <input
                  name="breakTime"
                  type="number"
                  placeholder="60"
                  min="0"
                  value={form.breakTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="cw-add-btn" onClick={handleAddCustom}>
              Add Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomWorkout;
