import { useState, useEffect } from "react";

// Workouts tab — assigned workouts + logs + assign modal
function WorkoutsTab({ clientUserId }) {
  const [assigned, setAssigned] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Active-Role": "coach",
  };

  // Load both data sources in parallel
  const loadData = async () => {
    try {
      setLoading(true);
      const [assignedRes, logsRes] = await Promise.all([
        fetch(
          `http://localhost:4000/api/coach/clients/${clientUserId}/workouts/assigned`,
          { headers }
        ),
        fetch(
          `http://localhost:4000/api/coach/clients/${clientUserId}/workouts/logs`,
          { headers }
        ),
      ]);

      if (!assignedRes.ok) throw new Error("Failed to load assigned workouts");
      if (!logsRes.ok) throw new Error("Failed to load workout logs");

      const assignedData = await assignedRes.json();
      const logsData = await logsRes.json();

      setAssigned(assignedData.data || []);
      setLogs(logsData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientUserId]);

  // Unassign a workout
  const handleUnassign = async (assignmentId) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/assignments/${assignmentId}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to unassign");
      }
      setAssigned((prev) =>
        prev.filter((a) => a.assigned_workout_id !== assignmentId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Called by modal after successful assign
  const handleAssigned = (newAssignment) => {
    setAssigned((prev) => [newAssignment, ...prev]);
    setShowAssignModal(false);
  };

  if (loading) return <div className="cd-state">Loading workouts…</div>;
  if (error) return <div className="cd-state cd-error">Error: {error}</div>;

  return (
    <div className="cd-workouts">
      {/* Assigned section */}
      <div className="cd-section">
        <div className="cd-section-header">
          <h3 className="cd-section-title">Assigned Workouts</h3>
          <button
            className="cd-btn cd-btn-primary"
            onClick={() => setShowAssignModal(true)}
          >
            + Assign Workout
          </button>
        </div>
        {assigned.length === 0 ? (
          <div className="cd-empty">
            No workouts assigned yet. Click "Assign Workout" to get started.
          </div>
        ) : (
          <div className="cd-assigned-list">
            {assigned.map((a) => (
              <AssignedRow
                key={a.assigned_workout_id}
                assignment={a}
                onUnassign={handleUnassign}
              />
            ))}
          </div>
        )}
      </div>

      {/* Logs section */}
      <div className="cd-section">
        <div className="cd-section-header">
          <h3 className="cd-section-title">Recent Workout Logs</h3>
        </div>
        {logs.length === 0 ? (
          <div className="cd-empty">
            No workouts logged yet. The client hasn't completed any workouts.
          </div>
        ) : (
          <div className="cd-logs-list">
            {logs.map((log) => (
              <LogRow key={log.workout_log_id} log={log} />
            ))}
          </div>
        )}
      </div>

      {showAssignModal && (
        <AssignModal
          clientUserId={clientUserId}
          onClose={() => setShowAssignModal(false)}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}

// Single assigned workout row
function AssignedRow({ assignment, onUnassign }) {
  const workout = assignment.Workout || {};
  const statusClass = `cd-status-badge cd-status-${assignment.status}`;

  return (
    <div className="cd-assigned-row">
      <div className="cd-assigned-info">
        <div className="cd-assigned-title">
          {workout.title || "Untitled workout"}
          <span className={statusClass}>{assignment.status}</span>
        </div>
        <div className="cd-assigned-meta">
          {workout.estimated_minutes && (
            <span>{workout.estimated_minutes} min</span>
          )}
          {assignment.due_date && (
            <>
              <span className="cd-meta-divider">·</span>
              <span>
                Due {new Date(assignment.due_date).toLocaleDateString()}
              </span>
            </>
          )}
          <span className="cd-meta-divider">·</span>
          <span>
            Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
          </span>
        </div>
        {assignment.coach_notes && (
          <div className="cd-assigned-notes">{assignment.coach_notes}</div>
        )}
      </div>
      <button
        className="cd-note-btn cd-note-btn-danger"
        onClick={() => onUnassign(assignment.assigned_workout_id)}
      >
        Unassign
      </button>
    </div>
  );
}

// Single workout log row
function LogRow({ log }) {
  const workout = log.Workout || {};
  return (
    <div className="cd-log-row">
      <div className="cd-log-date">
        {new Date(log.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="cd-log-info">
        <div className="cd-log-title">{workout.title || "Workout"}</div>
        <div className="cd-log-meta">
          {log.duration_minutes && <span>{log.duration_minutes} min</span>}
          {log.notes && (
            <>
              <span className="cd-meta-divider">·</span>
              <span className="cd-log-notes">{log.notes}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal for assigning a workout
function AssignModal({ clientUserId, onClose, onAssigned }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Active-Role": "coach",
  };

  // Load coach's own workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/workout/premade", {
          headers,
        });
        if (!res.ok) throw new Error("Failed to load your workouts");
        const data = await res.json();
        setWorkouts(data.data || []);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/clients/${clientUserId}/workouts/assign`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            workout_id: selectedId,
            due_date: dueDate || null,
            coach_notes: notes.trim() || null,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to assign workout");
      }
      const data = await res.json();
      // Build assignment object matching the shape of GET /assigned response
      const newAssignment = {
        assigned_workout_id: data.assignment.assigned_workout_id,
        coach_user_id: null,
        client_user_id: parseInt(clientUserId),
        workout_id: data.assignment.workout_id,
        assigned_at: data.assignment.assigned_at,
        due_date: data.assignment.due_date,
        status: data.assignment.status,
        completed_at: null,
        coach_notes: data.assignment.coach_notes,
        Workout: workouts.find((w) => w.workout_id === selectedId) || {
          workout_id: selectedId,
          title: data.assignment.workout_title,
        },
      };
      onAssigned(newAssignment);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cd-modal-header">
          <h3>Assign a Workout</h3>
          <button className="cd-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cd-modal-body">
          {loading ? (
            <div className="cd-state">Loading your workouts…</div>
          ) : workouts.length === 0 ? (
            <div className="cd-empty">
              You haven't created any workouts yet. Create one in the Workouts
              page first.
            </div>
          ) : (
            <>
              <label className="cd-modal-label">Select workout</label>
              <div className="cd-workout-picker">
                {workouts.map((w) => (
                  <div
                    key={w.workout_id}
                    className={`cd-workout-option ${
                      selectedId === w.workout_id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedId(w.workout_id)}
                  >
                    <div className="cd-workout-option-title">{w.title}</div>
                    <div className="cd-workout-option-meta">
                      {w.estimated_minutes ? `${w.estimated_minutes} min` : ""}
                      {w.description ? ` · ${w.description}` : ""}
                    </div>
                  </div>
                ))}
              </div>

              <label className="cd-modal-label">Due date (optional)</label>
              <input
                type="date"
                className="cd-modal-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />

              <label className="cd-modal-label">
                Notes for client (optional)
              </label>
              <textarea
                className="cd-notes-textarea"
                placeholder="e.g. Focus on form. Lower the weight if needed."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </>
          )}
        </div>

        <div className="cd-modal-footer">
          <button className="cd-btn cd-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="cd-btn cd-btn-primary"
            onClick={handleSubmit}
            disabled={!selectedId || submitting}
          >
            {submitting ? "Assigning…" : "Assign Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutsTab;
