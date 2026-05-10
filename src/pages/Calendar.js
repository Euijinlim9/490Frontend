import React, { useState, useEffect, useCallback } from "react";
import "../styles/Calendar.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { buildBackendUrl } from "../config/api";

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
const COLORS = [
  "#6ca6ff",
  "#54c4f2",
  "#7ed87e",
  "#f2a654",
  "#f27474",
  "#c47ef2",
];

function Calendar() {
  const today = new Date();
  const token = localStorage.getItem("token");

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignmentsByDate, setAssignmentsByDate] = useState({});
  const [personalEvents, setPersonalEvents] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(true);
  const [bookingsByDate, setBookingsByDate] = useState({});
  const { activeRole } = useContext(AuthContext);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(
        buildBackendUrl("/api/client/my-assigned-workouts"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": "client",
          },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      const map = {};
      (data.data || []).forEach((a) => {
        if (!a.due_date) return;
        if (!map[a.due_date]) map[a.due_date] = [];
        map[a.due_date].push(a);
      });
      setAssignmentsByDate(map);
    } catch {}
  }, [token]);

  const fetchPersonalEvents = useCallback(async () => {
    try {
      const res = await fetch(buildBackendUrl("/api/calendar"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPersonalEvents(data.data || []);
    } catch {}
  }, [token]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(
        buildBackendUrl("/api/sessions/bookings/upcoming"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }
      );
      if (!res.ok) return;
      const data = await res.json();

      // Group by date (YYYY-MM-DD in local time)
      const map = {};
      (data.bookings || []).forEach((b) => {
        const d = new Date(b.start_time);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
        if (!map[key]) map[key] = [];
        map[key].push(b);
      });
      setBookingsByDate(map);
    } catch {}
  }, [token, activeRole]);

  function getEndTime(startDate, durationMinutes) {
    const end = new Date(startDate.getTime() + durationMinutes * 60000);

    return end.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchAssignments(),
        fetchPersonalEvents(),
        fetchBookings(),
      ]);
      setLoading(false);
    };
    load();
  }, [fetchAssignments, fetchPersonalEvents, fetchBookings]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

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
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setInputText("");
    setSelectedColor(COLORS[0]);
    setModalOpen(true);
  };

  const handleAddEvent = async () => {
    if (!inputText.trim()) return;
    try {
      const res = await fetch(buildBackendUrl("/api/calendar"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: dateKey(selectedDate),
          text: inputText.trim(),
          color: selectedColor,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setPersonalEvents((prev) => [...prev, data.data]);
      setInputText("");
    } catch {}
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await fetch(buildBackendUrl(`/api/calendar/${eventId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setPersonalEvents((prev) =>
        prev.filter((e) => e.calendar_event_id !== eventId)
      );
    } catch {}
  };

  const getPersonalEventsForDate = (key) =>
    personalEvents.filter((e) => e.date === key);

  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const upcomingAssignmentDates = Object.keys(assignmentsByDate)
    .filter((k) => k >= todayKey)
    .sort();

  const upcomingPersonalDates = [
    ...new Set(
      personalEvents.filter((e) => e.date >= todayKey).map((e) => e.date)
    ),
  ].sort();
  const upcomingBookingDates = Object.keys(bookingsByDate)
    .filter((k) => k >= todayKey)
    .sort();

  const allUpcomingDates = [
    ...new Set([
      ...upcomingAssignmentDates,
      ...upcomingPersonalDates,
      ...upcomingBookingDates,
    ]),
  ]
    .sort()
    .slice(0, 10);

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
        <h2 className="panel-title">Upcoming Events</h2>
        {loading ? (
          <p className="no-events">Loading...</p>
        ) : allUpcomingDates.length === 0 ? (
          <p className="no-events">
            No upcoming events. Click a day to add one!
          </p>
        ) : (
          <div className="events-list">
            {allUpcomingDates.map((key) => (
              <div key={key} className="event-group">
                <span className="event-group-header">
                  {formatEventDate(key)}
                </span>
                {(assignmentsByDate[key] || []).map((a) => (
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
                {getPersonalEventsForDate(key).map((e) => (
                  <div key={e.calendar_event_id} className="cal-event-item">
                    <span
                      className="cal-event-title"
                      style={{ color: e.color }}
                    >
                      {e.text}
                    </span>
                  </div>
                ))}
                {(bookingsByDate[key] || []).map((b) => {
                  const start = new Date(b.start_time);
                  const time = start.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  const otherUser = activeRole === "coach" ? b.client : b.coach;
                  const endTime = getEndTime(start, b.duration_minutes);
                  return (
                    <div
                      key={`session-${b.booking_id}`}
                      className="cal-event-item"
                    >
                      <span className="cal-event-title cal-event-session-title">
                        {time} - {endTime} <br></br>Session with{" "}
                        {otherUser?.first_name} {otherUser?.last_name}
                      </span>
                    </div>
                  );
                })}
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
            const dayPersonal = getPersonalEventsForDate(key);
            const dayBookings = bookingsByDate[key] || [];
            const hasEvents =
              dayAssignments.length > 0 ||
              dayPersonal.length > 0 ||
              dayBookings.length > 0;
            return (
              <div
                key={key}
                className={`cal-cell ${isToday(day) ? "today" : ""} ${
                  hasEvents ? "has-plan" : ""
                }`}
                onClick={() => handleDayClick(day)}
              >
                <span className="cal-day-num">{day}</span>
                {hasEvents && (
                  <div className="plan-pills">
                    {[
                      ...dayAssignments.map((a) => ({
                        key: `workout-${a.assigned_workout_id}`,
                        label: a.Workout?.title || "Workout",
                        cls: statusBadgeClass(a.status),
                        style: {},
                      })),
                      ...dayPersonal.map((e) => ({
                        key: `personal-${e.calendar_event_id}`,
                        label: e.text,
                        cls: "",
                        style: { background: e.color },
                      })),
                      ...dayBookings.map((b) => ({
                        key: `session-${b.booking_id}`,
                        label: `${new Date(b.start_time).toLocaleTimeString(
                          [],
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )} · ${
                          activeRole === "coach"
                            ? b.client?.first_name
                            : b.coach?.first_name
                        }`,
                        cls: "cal-event-session",
                        style: {},
                      })),
                    ].map((item) => (
                      <span
                        key={item.key}
                        className={`plan-pill ${item.cls}`}
                        style={item.style}
                      >
                        {item.label}
                      </span>
                    ))}
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

            {(assignmentsByDate[dateKey(selectedDate)] || []).map((a) => (
              <div key={a.assigned_workout_id} className="modal-assignment">
                <div className="modal-assignment-header">
                  <span className="modal-assignment-title">
                    {a.Workout?.title || "Workout"}
                  </span>
                  <span
                    className={`cal-event-badge ${statusBadgeClass(a.status)}`}
                  >
                    {a.status}
                  </span>
                </div>
                {a.Workout?.estimated_minutes && (
                  <div className="modal-assignment-meta">
                    <span>{a.Workout.estimated_minutes} min</span>
                  </div>
                )}
                {a.coach_notes && (
                  <div className="modal-coach-notes">"{a.coach_notes}"</div>
                )}
              </div>
            ))}

            {getPersonalEventsForDate(dateKey(selectedDate)).map((e) => (
              <div
                key={e.calendar_event_id}
                className="modal-plan-item"
                style={{ borderLeftColor: e.color }}
              >
                <span>{e.text}</span>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteEvent(e.calendar_event_id)}
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="color-picker-row">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-swatch ${
                    selectedColor === c ? "active-swatch" : ""
                  }`}
                  style={{ background: c }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>

            <div className="modal-input-row">
              <input
                className="modal-input"
                type="text"
                placeholder="Add a plan..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
              />
              <button className="modal-add-btn" onClick={handleAddEvent}>
                Add
              </button>
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
