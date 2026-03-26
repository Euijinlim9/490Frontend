import React, { useState } from "react";
import "../styles/Calendar.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const COLORS = ["#6ca6ff", "#54c4f2", "#7ed87e", "#f2a654", "#f27474", "#c47ef2"];

function Calendar() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [plans, setPlans] = useState({});
  const [inputText, setInputText] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [modalOpen, setModalOpen] = useState(false);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells = [...blanks, ...days];

  const dateKey = (day) => `${currentYear}-${currentMonth + 1}-${day}`;

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
    setSelectedDate(day);
    setInputText("");
    setModalOpen(true);
  };

  const handleAddPlan = () => {
    if (!inputText.trim()) return;
    const key = dateKey(selectedDate);
    setPlans((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { text: inputText.trim(), color: selectedColor }],
    }));
    setInputText("");
  };

  const handleDeletePlan = (key, index) => {
    setPlans((prev) => {
      const updated = [...(prev[key] || [])];
      updated.splice(index, 1);
      return { ...prev, [key]: updated };
    });
  };

  const handleColorChange = (key, index, color) => {
    setPlans((prev) => {
      const updated = [...(prev[key] || [])];
      updated[index] = { ...updated[index], color };
      return { ...prev, [key]: updated };
    });
  };

  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const allEvents = Object.entries(plans)
    .flatMap(([key, items]) =>
      items.map((item) => ({ key, text: item.text, color: item.color }))
    )
    .filter(({ key }) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m - 1, d) >= todayMidnight;
    })
    .sort((a, b) => {
      const [ay, am, ad] = a.key.split("-").map(Number);
      const [by, bm, bd] = b.key.split("-").map(Number);
      return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
    });

  const groupedEvents = allEvents.reduce((acc, event) => {
    if (!acc[event.key]) acc[event.key] = [];
    acc[event.key].push(event);
    return acc;
  }, {});

  const sortedGroupKeys = Object.keys(groupedEvents).sort((a, b) => {
    const [ay, am, ad] = a.split("-").map(Number);
    const [by, bm, bd] = b.split("-").map(Number);
    return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
  });

  const formatEventDate = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
  };

  return (
    <div className="calendar-page">

      <div className="calendar-events-panel">
        <h2 className="panel-title">Upcoming Events</h2>
        {sortedGroupKeys.length === 0 ? (
          <p className="no-events">No events yet. Click a day to add one!</p>
        ) : (
          <div className="events-list">
            {sortedGroupKeys.map((key) => (
              <div key={key} className="event-group">
                <span className="event-group-header">{formatEventDate(key)}</span>
                {groupedEvents[key].map((event, i) => (
                  <span key={i} className="event-label" style={{ color: event.color }}>
                    {event.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="calendar-main-panel">
        <div className="cal-header">
          <button className="cal-arrow" onClick={prevMonth}>‹</button>
          <h2 className="cal-month-label">{MONTHS[currentMonth]} {currentYear}</h2>
          <button className="cal-arrow" onClick={nextMonth}>›</button>
        </div>

        <div className="cal-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="cal-weekday">{d}</div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} className="cal-cell empty" />;
            const key = dateKey(day);
            const hasPlan = plans[key] && plans[key].length > 0;
            return (
              <div
                key={key}
                className={`cal-cell ${isToday(day) ? "today" : ""} ${hasPlan ? "has-plan" : ""}`}
                onClick={() => handleDayClick(day)}
              >
                <span className="cal-day-num">{day}</span>
                {hasPlan && (
                  <div className="plan-pills">
                    {plans[key].slice(0, 2).map((plan, idx) => (
                      <span
                        key={idx}
                        className="plan-pill"
                        style={{ background: plan.color }}
                      >
                        {plan.text}
                      </span>
                    ))}
                    {plans[key].length > 2 && (
                      <span className="plan-pill-more">+{plans[key].length - 2} more</span>
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

            <ul className="modal-plans">
              {(plans[dateKey(selectedDate)] || []).length === 0 ? (
                <li className="modal-no-plans">No plans yet.</li>
              ) : (
                (plans[dateKey(selectedDate)] || []).map((plan, idx) => (
                  <li key={idx} className="modal-plan-item" style={{ borderLeftColor: plan.color }}>
                    <span>{plan.text}</span>
                    <div className="plan-item-actions">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          className={`color-swatch ${plan.color === c ? "active-swatch" : ""}`}
                          style={{ background: c }}
                          onClick={() => handleColorChange(dateKey(selectedDate), idx, c)}
                        />
                      ))}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeletePlan(dateKey(selectedDate), idx)}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>

            <div className="color-picker-row">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-swatch ${selectedColor === c ? "active-swatch" : ""}`}
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
                onKeyDown={(e) => e.key === "Enter" && handleAddPlan()}
              />
              <button className="modal-add-btn" onClick={handleAddPlan}>Add</button>
            </div>

            <button className="modal-close-btn" onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Calendar;
