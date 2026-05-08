import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/BookSession.css";

function BookSession() {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const { activeRole } = useContext(AuthContext);

  const [coach, setCoach] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activePurchase, setActivePurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected day in calendar
  const [selectedDay, setSelectedDay] = useState(null);

  // Booking modal state
  const [pendingSlot, setPendingSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [booking, setBooking] = useState(false);

  // Calendar navigation
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const [coachRes, slotsRes, purchaseRes] = await Promise.all([
        fetch(`http://localhost:4000/api/coaches/${coachId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:4000/api/coaches/${coachId}/availability`),
        fetch(
          `http://localhost:4000/api/sessions/purchases/active-with/${coachId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": "client",
            },
          }
        ),
      ]);

      if (!coachRes.ok) throw new Error("Failed to load coach");
      const coachData = await coachRes.json();
      setCoach(coachData);

      const slotsData = slotsRes.ok ? await slotsRes.json() : { slots: [] };
      setSlots(slotsData.slots || []);

      const purchaseData = purchaseRes.ok
        ? await purchaseRes.json()
        : { purchase: null };
      setActivePurchase(purchaseData.purchase);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Group slots by date (YYYY-MM-DD in local time)
  const slotsByDate = useMemo(() => {
    const grouped = {};
    for (const slot of slots) {
      const d = new Date(slot.start_time);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(slot);
    }
    return grouped;
  }, [slots]);

  // Auto-select first available date when slots load
  useEffect(() => {
    if (!selectedDay && Object.keys(slotsByDate).length > 0) {
      const sorted = Object.keys(slotsByDate).sort();
      setSelectedDay(sorted[0]);
      // Jump calendar to that month
      const firstDate = new Date(sorted[0] + "T00:00:00");
      setViewMonth(firstDate.getMonth());
      setViewYear(firstDate.getFullYear());
    }
  }, [slotsByDate, selectedDay]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [viewMonth, viewYear]);

  const dayKey = (day) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  const isAvailable = (day) => !!slotsByDate[dayKey(day)];

  const isSelected = (day) => dayKey(day) === selectedDay;

  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(23, 59, 59, 999);
    return d < new Date();
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  const formatDayLabel = (key) => {
    if (!key) return "";
    const d = new Date(key + "T00:00:00");
    return d.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const handleConfirmBook = async () => {
    if (!pendingSlot) return;
    setBooking(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/sessions/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Active-Role": "client",
        },
        body: JSON.stringify({
          coach_user_id: parseInt(coachId),
          start_time: pendingSlot.start_time,
          client_notes: bookingNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not book session");
        return;
      }
      alert(
        `Booked! ${data.sessions_remaining} session${
          data.sessions_remaining === 1 ? "" : "s"
        } remaining.`
      );
      setPendingSlot(null);
      setBookingNotes("");
      // Refresh data — slot disappears, credits decrement
      fetchAll();
    } catch (err) {
      alert("Could not book session. Try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="bs-page">
        <div className="bs-status">Loading...</div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="bs-page">
        <div className="bs-status">
          <h2>{error || "Coach not found"}</h2>
          <Link to="/dashboard" className="bs-back">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (activeRole !== "client") {
    return (
      <div className="bs-page">
        <div className="bs-status">
          <h2>Switch to client mode to book a session.</h2>
          <Link to="/dashboard" className="bs-back">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  if (!activePurchase) {
    return (
      <div className="bs-page">
        <div className="bs-container">
          <Link to={`/coach/${coachId}`} className="bs-back">
            ← Back to coach
          </Link>
          <div className="bs-empty-credits">
            <div className="bs-empty-icon">📭</div>
            <h2>No active sessions</h2>
            <p>
              You don't have any session credits with {coach.first_name} yet.
              Purchase a package to book your first session.
            </p>
            <Link to={`/coach/${coachId}`} className="bs-btn-primary">
              View Packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const months = [
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
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const slotsForSelected = selectedDay ? slotsByDate[selectedDay] || [] : [];

  return (
    <div className="bs-page">
      <div className="bs-container">
        <Link to={`/coach/${coachId}`} className="bs-back">
          ← Back to {coach.first_name}'s profile
        </Link>

        <div className="bs-header">
          <h1>Book a Session with {coach.first_name}</h1>
          <div className="bs-credits-pill">
            <strong>{activePurchase.sessions_remaining}</strong> session
            {activePurchase.sessions_remaining === 1 ? "" : "s"} remaining
          </div>
        </div>

        <div className="bs-grid">
          {/* Calendar */}
          <div className="bs-calendar-card">
            <div className="bs-cal-header">
              <button
                onClick={prevMonth}
                className="bs-cal-nav"
                aria-label="Previous month"
              >
                ‹
              </button>
              <h3>
                {months[viewMonth]} {viewYear}
              </h3>
              <button
                onClick={nextMonth}
                className="bs-cal-nav"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
            <div className="bs-cal-weekdays">
              {weekdays.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="bs-cal-grid">
              {calendarCells.map((day, i) => {
                if (!day) return <div key={i} className="bs-cal-cell empty" />;
                const available = isAvailable(day);
                const past = isPast(day);
                const selected = isSelected(day);
                return (
                  <button
                    key={i}
                    className={`bs-cal-cell ${available ? "available" : ""} ${
                      selected ? "selected" : ""
                    } ${past ? "past" : ""}`}
                    onClick={() =>
                      available && !past && setSelectedDay(dayKey(day))
                    }
                    disabled={!available || past}
                  >
                    {day}
                    {available && !past && <span className="bs-cal-dot" />}
                  </button>
                );
              })}
            </div>
            <p className="bs-cal-legend">
              <span className="bs-legend-dot" /> Available days
            </p>
          </div>

          {/* Slot list */}
          <div className="bs-slots-card">
            <h3>
              {selectedDay ? formatDayLabel(selectedDay) : "Select a day"}
            </h3>
            {slotsForSelected.length === 0 ? (
              <p className="bs-empty">
                {Object.keys(slotsByDate).length === 0
                  ? "No availability in the next 8 weeks."
                  : "Pick a day with available slots from the calendar."}
              </p>
            ) : (
              <div className="bs-slots-list">
                {slotsForSelected.map((slot) => (
                  <button
                    key={slot.start_time}
                    className="bs-slot-pill"
                    onClick={() => setPendingSlot(slot)}
                  >
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    <span className="bs-slot-duration">
                      {slot.duration_minutes} min
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking confirm modal */}
      {pendingSlot && (
        <div
          className="bs-modal-overlay"
          onClick={() => !booking && setPendingSlot(null)}
        >
          <div className="bs-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="bs-modal-close"
              onClick={() => setPendingSlot(null)}
              disabled={booking}
            >
              ✕
            </button>
            <h3 className="bs-modal-title">Confirm Booking</h3>
            <div className="bs-modal-summary">
              <div className="bs-modal-row">
                <span>Coach</span>
                <strong>
                  {coach.first_name} {coach.last_name}
                </strong>
              </div>
              <div className="bs-modal-row">
                <span>When</span>
                <strong>
                  {new Date(pendingSlot.start_time).toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>
              </div>
              <div className="bs-modal-row">
                <span>Time</span>
                <strong>
                  {formatTime(pendingSlot.start_time)} –{" "}
                  {formatTime(pendingSlot.end_time)}
                </strong>
              </div>
              <div className="bs-modal-row">
                <span>Duration</span>
                <strong>{pendingSlot.duration_minutes} min</strong>
              </div>
              <div className="bs-modal-row">
                <span>Sessions remaining after</span>
                <strong>{activePurchase.sessions_remaining - 1}</strong>
              </div>
            </div>

            <label className="bs-modal-notes-label">
              Notes for your coach (optional)
            </label>
            <textarea
              className="bs-modal-notes"
              placeholder="e.g. I'd like to focus on lower body, I have a sore shoulder, etc."
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              maxLength={500}
              rows={3}
              disabled={booking}
            />

            <button
              className="bs-modal-confirm"
              onClick={handleConfirmBook}
              disabled={booking}
            >
              {booking ? "Booking..." : "Confirm Booking"}
            </button>
            <p className="bs-modal-disclaimer">
              This will use 1 session credit. You can cancel up to 24 hours
              before.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookSession;
