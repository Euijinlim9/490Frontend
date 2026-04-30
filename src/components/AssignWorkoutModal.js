import React, { useEffect, useState } from "react";

function AssignWorkoutModal({ clientUserId, onClose, onAssigned }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/workout/premade", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load your workouts");
        const data = await res.json();
        setWorkouts(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!selectedId) {
      setError("Please select a workout.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/clients/${clientUserId}/workouts/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Active-Role": "coach",
          },
          body: JSON.stringify({
            workout_id: selectedId,
            due_date: dueDate || null,
            coach_notes: notes.trim() || null,
          }),
        }
      );

      if (res.status === 409) {
        const data = await res.json();
        setError(data.error || "This workout is already assigned.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to assign workout");
      }

      onAssigned();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="cp-modal-overlay"
      onClick={submitting ? undefined : onClose}
    >
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cp-modal-header">
          <h3>Assign a Workout</h3>
          <button
            type="button"
            className="cp-modal-close"
            onClick={onClose}
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <div className="cp-modal-body">
          {loading ? (
            <p className="empty-state">Loading your workouts…</p>
          ) : workouts.length === 0 ? (
            <p className="empty-state">
              You haven't created any workouts yet. Create one in the Workouts
              page first.
            </p>
          ) : (
            <>
              <label className="cp-modal-label">Select workout</label>
              <div className="cp-workout-picker">
                {workouts.map((w) => (
                  <div
                    key={w.workout_id}
                    className={`cp-workout-option ${
                      selectedId === w.workout_id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedId(w.workout_id)}
                  >
                    <div className="cp-workout-option-title">{w.title}</div>
                    <div className="cp-workout-option-meta">
                      {w.estimated_minutes ? `${w.estimated_minutes} min` : ""}
                      {w.description ? ` · ${w.description}` : ""}
                    </div>
                  </div>
                ))}
              </div>

              <label className="cp-modal-label">Due date (optional)</label>
              <input
                type="date"
                className="cp-modal-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />

              <label className="cp-modal-label">
                Notes for client (optional)
              </label>
              <textarea
                className="cp-modal-input cp-modal-textarea"
                placeholder="e.g. Focus on form. Lower the weight if needed."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
              />

              {error && <p className="cp-modal-error">{error}</p>}
            </>
          )}
        </div>

        <div className="cp-modal-footer">
          <button
            type="button"
            className="cp-btn cp-btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            onClick={handleSubmit}
            disabled={!selectedId || submitting || loading}
          >
            {submitting ? "Assigning…" : "Assign Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignWorkoutModal;
