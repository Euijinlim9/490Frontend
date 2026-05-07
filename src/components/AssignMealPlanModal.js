import React, { useEffect, useState } from "react";

function AssignMealPlanModal({ clientUserId, onClose, onAssigned }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [items, setItems] = useState([{ meal_id: "", day_number: 1, meal_time: "breakfast", servings: 1 }]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/meals/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load meals");
        const data = await res.json();
        setMeals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [token]);

  const addItem = () =>
    setItems((prev) => [...prev, { meal_id: "", day_number: 1, meal_time: "breakfast", servings: 1 }]);

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (index, field, value) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const handleSubmit = async () => {
    if (!planName.trim()) return setError("Plan name is required.");
    if (!startDate) return setError("Start date is required.");
    if (items.some((i) => !i.meal_id)) return setError("Please select a meal for every item.");

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/clients/${clientUserId}/meal-plans/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Active-Role": "coach",
          },
          body: JSON.stringify({
            name: planName.trim(),
            start_date: startDate,
            end_date: endDate || null,
            items: items.map((i) => ({
              meal_id: parseInt(i.meal_id),
              day_number: parseInt(i.day_number),
              meal_time: i.meal_time,
              servings: parseFloat(i.servings) || 1,
            })),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to assign meal plan");
      }

      onAssigned();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMeals = meals.filter((m) =>
    (m.name || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="cp-modal-overlay" onClick={submitting ? undefined : onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="cp-modal-header">
          <h3>Assign a Meal Plan</h3>
          <button type="button" className="cp-modal-close" onClick={onClose} disabled={submitting}>
            ×
          </button>
        </div>

        <div className="cp-modal-body">
          {loading ? (
            <p className="empty-state">Loading meals…</p>
          ) : (
            <>
              <label className="cp-modal-label">Plan name</label>
              <input
                type="text"
                className="cp-modal-input"
                placeholder="e.g. Week 1 Cutting Plan"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                maxLength={100}
              />

              <label className="cp-modal-label">Start date</label>
              <input
                type="date"
                className="cp-modal-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <label className="cp-modal-label">End date (optional)</label>
              <input
                type="date"
                className="cp-modal-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />

              <label className="cp-modal-label" style={{ marginTop: 12 }}>
                Meals
              </label>
              <input
                type="text"
                className="cp-modal-input search"
                placeholder="Search meals…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 60px 100px 60px auto",
                    gap: 6,
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <select
                    className="cp-modal-input"
                    value={item.meal_id}
                    onChange={(e) => updateItem(index, "meal_id", e.target.value)}
                    style={{ margin: 0 }}
                  >
                    <option value="">Select meal</option>
                    {filteredMeals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    className="cp-modal-input"
                    min={1}
                    value={item.day_number}
                    onChange={(e) => updateItem(index, "day_number", e.target.value)}
                    placeholder="Day"
                    style={{ margin: 0 }}
                  />

                  <select
                    className="cp-modal-input"
                    value={item.meal_time}
                    onChange={(e) => updateItem(index, "meal_time", e.target.value)}
                    style={{ margin: 0 }}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>

                  <input
                    type="number"
                    className="cp-modal-input"
                    min={0.5}
                    step={0.5}
                    value={item.servings}
                    onChange={(e) => updateItem(index, "servings", e.target.value)}
                    placeholder="Srv"
                    style={{ margin: 0 }}
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="cp-btn cp-btn-ghost"
                      onClick={() => removeItem(index)}
                      style={{ padding: "4px 8px" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="cp-btn cp-btn-ghost" onClick={addItem} style={{ marginTop: 4 }}>
                + Add meal
              </button>

              {error && <p className="cp-modal-error">{error}</p>}
            </>
          )}
        </div>

        <div className="cp-modal-footer">
          <button type="button" className="cp-btn cp-btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            onClick={handleSubmit}
            disabled={submitting || loading}
          >
            {submitting ? "Assigning…" : "Assign Meal Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignMealPlanModal;
