import React, { useState, useEffect } from "react";
import "../styles/Calendar.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Calendar() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignmentsByDate, setAssignmentsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assigned workouts on mount
  useEffect(() => {
    const fetchAssignments = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "http://localhost:4000/api/client/my-assigned-workouts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": "client",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to load assignments");
        const data = await res.json();

        // Group by due_date (YYYY-MM-DD)
        const map = {};
        (data.data || []).forEach((a) => {
          if (!a.due_date) return; // skip assignments without due date
          // a.due_date is "2026-04-26", we use it as the key directly
          if (!map[a.due_date]) map[a.due_date] = [];
          map[a.due_date].push(a);
        });
        setAssignmentsByDate(map);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells = [...blanks, ...days];

  // Build a date key matching the format from the API: "YYYY-MM-DD"
  const dateKey = (day) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day) => {
    const key = dateKey(day);
    if (!assignmentsByDate[key]) return; // no assignments → no modal
    setSelectedDate(day);
    setModalOpen(true);
  };

  // Build "upcoming events" list (today + future, sorted)
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const upcomingDates = Object.keys(assignmentsByDate)
    .filter((key) => key >= todayKey)
    .sort();

  const formatEventDate = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
  };

  const statusBadgeClass = (status) => {
    if (status === "completed") return "cal-status-completed";
    if (status === "skipped") return "cal-status-skipped";
    return "cal-status-assigned";
  };

  return (
    <div className="calendar-page">
      <div className="calendar-events-panel">
        <h2 className="panel-title">Upcoming Workouts</h2>
        {loading ? (
          <p className="no-events">Loading...</p>
        ) : error ? (
          <p className="no-events">Error: {error}</p>
        ) : upcomingDates.length === 0 ? (
          <p className="no-events">
            No workouts assigned. Your coach will send some your way.
          </p>
        ) : (
          <div className="events-list">
            {upcomingDates.map((key) => (
              <div key={key} className="event-group">
                <span className="event-group-header">
                  {formatEventDate(key)}
                </span>
                {assignmentsByDate[key].map((a) => (
                  <div key={a.assigned_workout_id} className="cal-event-item">
                    <span className="cal-event-title">
                      {a.Workout?.title || "Workout"}
                    </span>
                    <span
                      className={`cal-event-badge ${statusBadgeClass(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="calendar-main-panel">
        <div className="cal-header">
          <button className="cal-arrow" onClick={prevMonth}>
            ‹
          </button>
          <h2 className="cal-month-label">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button className="cal-arrow" onClick={nextMonth}>
            ›
          </button>
        </div>

        <div className="cal-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="cal-weekday">
              {d}
            </div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((day, i) => {
            if (!day)
              return <div key={`blank-${i}`} className="cal-cell empty" />;
            const key = dateKey(day);
            const dayAssignments = assignmentsByDate[key] || [];
            const hasWorkout = dayAssignments.length > 0;
            return (
              <div
                key={key}
                className={`cal-cell ${isToday(day) ? "today" : ""} ${
                  hasWorkout ? "has-plan" : ""
                }`}
                onClick={() => handleDayClick(day)}
              >
                <span className="cal-day-num">{day}</span>
                {hasWorkout && (
                  <div className="plan-pills">
                    {dayAssignments.slice(0, 2).map((a) => (
                      <span
                        key={a.assigned_workout_id}
                        className={`plan-pill ${statusBadgeClass(a.status)}`}
                      >
                        {a.Workout?.title || "Workout"}
                      </span>
                    ))}
                    {dayAssignments.length > 2 && (
                      <span className="plan-pill-more">
                        +{dayAssignments.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && selectedDate && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {MONTHS[currentMonth]} {selectedDate}, {currentYear}
            </h3>

            <div className="modal-assignments">
              {(assignmentsByDate[dateKey(selectedDate)] || []).map((a) => (
                <div key={a.assigned_workout_id} className="modal-assignment">
                  <div className="modal-assignment-header">
                    <span className="modal-assignment-title">
                      {a.Workout?.title || "Workout"}
                    </span>
                    <span
                      className={`cal-event-badge ${statusBadgeClass(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  {a.Workout?.description && (
                    <p className="modal-assignment-desc">
                      {a.Workout.description}
                    </p>
                  )}
                  <div className="modal-assignment-meta">
                    {a.Workout?.estimated_minutes && (
                      <span>{a.Workout.estimated_minutes} min</span>
                    )}
                    {a.coach && (
                      <span>
                        From {a.coach.first_name} {a.coach.last_name}
                      </span>
                    )}
                  </div>
                  {a.coach_notes && (
                    <div className="modal-coach-notes">"{a.coach_notes}"</div>
                  )}
                </div>
              ))}
            </div>

            <button
              className="modal-close-btn"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
