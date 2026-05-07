import React, { useState, useEffect, useCallback } from "react";
import "../styles/NutritionistPlans.css";

const MEAL_TIMES = ["breakfast", "lunch", "dinner", "snack"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function NutritionistPlans() {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [meals, setMeals] = useState([]);
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedule, setSchedule] = useState({});
  const [toast, setToast] = useState("");
  const [showNewMeal, setShowNewMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: "", calories_per_serving: "", protein: "", carbs: "", fat: "", description: "" });
  const [mealSearch, setMealSearch] = useState("");
  const [activeTab, setActiveTab] = useState("plans"); // "plans" | "meals"

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/api/nutritionist/clients", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setClients(data.data || []);
    } catch {}
  }, [token]);

  const fetchMeals = useCallback(async () => {
    try {
      const url = mealSearch
        ? `http://localhost:4000/api/nutritionist/meals?search=${encodeURIComponent(mealSearch)}`
        : "http://localhost:4000/api/nutritionist/meals";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setMeals(data || []);
    } catch {}
  }, [token, mealSearch]);

  useEffect(() => { fetchClients(); }, [fetchClients]);
  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const toggleMeal = (dayIndex, mealTime, meal) => {
    const key = `${dayIndex}-${mealTime}`;
    setSchedule((prev) => {
      const current = prev[key];
      if (current?.meal_id === meal.id) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { meal_id: meal.id, name: meal.name, calories: meal.calories_per_serving } };
    });
  };

  const handleAssign = async () => {
    if (!selectedClient || !planName || !startDate) {
      showToast("Please fill in plan name and start date.");
      return;
    }
    if (Object.keys(schedule).length === 0) {
      showToast("Please assign at least one meal.");
      return;
    }

    const items = Object.entries(schedule).map(([key, val]) => {
      const [dayIndex, mealTime] = key.split("-");
      return { meal_id: val.meal_id, day_number: parseInt(dayIndex) + 1, meal_time: mealTime, servings: 1 };
    });

    try {
      const res = await fetch(`http://localhost:4000/api/nutritionist/clients/${selectedClient.client_user_id}/meal-plan`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: planName, start_date: startDate, end_date: endDate || null, items }),
      });
      if (!res.ok) { const d = await res.json(); showToast(d.error || "Failed to assign plan."); return; }
      showToast("Meal plan assigned successfully!");
      setPlanName("");
      setStartDate("");
      setEndDate("");
      setSchedule({});
    } catch { showToast("Something went wrong."); }
  };

  const handleCreateMeal = async () => {
    if (!newMeal.name || !newMeal.calories_per_serving) { showToast("Name and calories are required."); return; }
    try {
      const res = await fetch("http://localhost:4000/api/nutritionist/meals", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...newMeal,
          calories_per_serving: parseFloat(newMeal.calories_per_serving),
          protein: parseFloat(newMeal.protein) || null,
          carbs: parseFloat(newMeal.carbs) || null,
          fat: parseFloat(newMeal.fat) || null,
        }),
      });
      if (!res.ok) { showToast("Failed to create meal."); return; }
      showToast("Meal created!");
      setNewMeal({ name: "", calories_per_serving: "", protein: "", carbs: "", fat: "", description: "" });
      setShowNewMeal(false);
      fetchMeals();
    } catch { showToast("Something went wrong."); }
  };

  const getAssigned = (dayIndex, mealTime) => schedule[`${dayIndex}-${mealTime}`];

  return (
    <div className="np-page">
      {toast && <div className="np-toast">{toast}</div>}

      <div className="np-layout">
        {/* Sidebar */}
        <div className="np-sidebar">
          <h2 className="np-sidebar-title">My Clients</h2>
          {clients.length === 0 ? (
            <div className="np-no-clients">
              <div className="np-no-clients-icon">👤</div>
              <p>No clients signed up yet.</p>
              <span>Once a client requests you and you approve them, they'll appear here.</span>
            </div>
          ) : (
            clients.map((c) => (
              <div
                key={c.client_user_id}
                className={`np-client-card ${selectedClient?.client_user_id === c.client_user_id ? "active" : ""}`}
                onClick={() => { setSelectedClient(c); setActiveTab("plans"); }}
              >
                <div className="np-client-name">{c.first_name} {c.last_name}</div>
                {c.diet_preference && <div className="np-client-meta">{c.diet_preference}</div>}
              </div>
            ))
          )}
        </div>

        {/* Main */}
        <div className="np-main">

          {/* Tabs */}
          <div className="np-tabs">
            <button
              className={`np-tab ${activeTab === "plans" ? "active" : ""}`}
              onClick={() => setActiveTab("plans")}
            >
              Meal Plans
            </button>
            <button
              className={`np-tab ${activeTab === "meals" ? "active" : ""}`}
              onClick={() => setActiveTab("meals")}
            >
              Meal Library
            </button>
          </div>

          {/* Meal Plans Tab */}
          {activeTab === "plans" && (
            <>
              {!selectedClient ? (
                <div className="np-empty-state">
                  <div className="np-empty-icon">🥗</div>
                  <h3>No client selected</h3>
                  <p>
                    {clients.length === 0
                      ? "You have no clients yet. Share your profile so clients can request you."
                      : "Select a client from the left to assign a meal plan."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="np-main-header">
                    <div>
                      <h2>{selectedClient.first_name} {selectedClient.last_name}</h2>
                      {selectedClient.goal && <p className="np-client-goal">Goal: {selectedClient.goal}</p>}
                    </div>
                  </div>

                  <div className="np-plan-meta">
                    <input className="np-input" placeholder="Plan name *" value={planName} onChange={(e) => setPlanName(e.target.value)} />
                    <input className="np-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input className="np-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>

                  <div className="np-schedule">
                    <div className="np-schedule-grid">
                      <div className="np-schedule-corner"></div>
                      {DAYS.map((d) => <div key={d} className="np-day-header">{d}</div>)}
                      {MEAL_TIMES.map((time) => (
                        <React.Fragment key={time}>
                          <div className="np-time-label">{time}</div>
                          {DAYS.map((_, dayIndex) => {
                            const assigned = getAssigned(dayIndex, time);
                            return (
                              <div key={dayIndex} className={`np-cell ${assigned ? "np-cell-filled" : ""}`}>
                                {assigned ? (
                                  <div className="np-cell-meal">
                                    <span>{assigned.name}</span>
                                    <button className="np-cell-remove" onClick={() => toggleMeal(dayIndex, time, { id: assigned.meal_id })}>✕</button>
                                  </div>
                                ) : (
                                  <select className="np-cell-select" value="" onChange={(e) => { const meal = meals.find((m) => m.id === parseInt(e.target.value)); if (meal) toggleMeal(dayIndex, time, meal); }}>
                                    <option value="">+ Add</option>
                                    {meals.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.calories_per_serving} cal)</option>)}
                                  </select>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="np-actions">
                    <button className="np-btn-assign" onClick={handleAssign}>Assign Meal Plan</button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Meal Library Tab */}
          {activeTab === "meals" && (
            <div className="np-meals-section">
              <div className="np-meals-header">
                <h3>Meal Library</h3>
                <div className="np-meals-controls">
                  <input
                    className="np-input"
                    placeholder="Search meals..."
                    value={mealSearch}
                    onChange={(e) => setMealSearch(e.target.value)}
                  />
                  <button className="np-btn-new" onClick={() => setShowNewMeal(!showNewMeal)}>
                    + New Meal
                  </button>
                </div>
              </div>

              {showNewMeal && (
                <div className="np-new-meal-form">
                  <input className="np-input" placeholder="Meal name *" value={newMeal.name} onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })} />
                  <input className="np-input" type="number" placeholder="Calories per serving *" value={newMeal.calories_per_serving} onChange={(e) => setNewMeal({ ...newMeal, calories_per_serving: e.target.value })} />
                  <input className="np-input" type="number" placeholder="Protein (g)" value={newMeal.protein} onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })} />
                  <input className="np-input" type="number" placeholder="Carbs (g)" value={newMeal.carbs} onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })} />
                  <input className="np-input" type="number" placeholder="Fat (g)" value={newMeal.fat} onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })} />
                  <input className="np-input" placeholder="Description (optional)" value={newMeal.description} onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })} />
                  <div className="np-new-meal-actions">
                    <button className="np-btn-assign" onClick={handleCreateMeal}>Save Meal</button>
                    <button className="np-btn-cancel" onClick={() => setShowNewMeal(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {meals.length === 0 ? (
                <div className="np-empty-state">
                  <div className="np-empty-icon">🍽️</div>
                  <h3>No meals yet</h3>
                  <p>Click "+ New Meal" to add your first meal to the library.</p>
                </div>
              ) : (
                <div className="np-meals-grid">
                  {meals.map((m) => (
                    <div key={m.id} className="np-meal-card">
                      <div className="np-meal-name">{m.name}</div>
                      <div className="np-meal-meta">
                        {m.calories_per_serving} cal
                        {m.protein ? ` · ${m.protein}g protein` : ""}
                        {m.carbs ? ` · ${m.carbs}g carbs` : ""}
                        {m.fat ? ` · ${m.fat}g fat` : ""}
                      </div>
                      {m.description && <div className="np-meal-desc">{m.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NutritionistPlans;
