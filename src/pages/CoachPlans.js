import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/CoachPlans.css";

const EMPTY_FORM = {
  title: "",
  plan_duration: "",
  price: "",
  currency: "USD",
  description: "",
};

function CoachPlans() {
  const { activeRole } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const token = () => localStorage.getItem("token");
  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token()}`,
    "X-Active-Role": activeRole,
  });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/coach/plans", {
        headers: headers(),
      });
      const data = await res.json();
      setPlans(data);
    } catch {
      setError("Could not load plans.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("http://localhost:4000/api/coach/plans", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          ...form,
          plan_duration: Number(form.plan_duration),
          price: Number(form.price),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setForm(EMPTY_FORM);
      fetchPlans();
    } catch (err) {
      alert(err.message || "Could not create plan.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (plan) => {
    setEditId(plan.plan_id);
    setEditForm({
      title: plan.title,
      plan_duration: plan.plan_duration,
      price: plan.price,
      currency: plan.currency,
      description: plan.description || "",
    });
  };

  const handleSaveEdit = async (planId) => {
    setSaving(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/plans/${planId}`,
        {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({
            ...editForm,
            plan_duration: Number(editForm.plan_duration),
            price: Number(editForm.price),
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setEditId(null);
      fetchPlans();
    } catch (err) {
      alert(err.message || "Could not save plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (planId) => {
    if (
      !window.confirm("Deactivate this plan? It won't be visible to clients.")
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/plans/${planId}`,
        {
          method: "DELETE",
          headers: headers(),
        }
      );
      if (!res.ok) throw new Error();
      fetchPlans();
    } catch {
      alert("Could not deactivate plan.");
    }
  };

  return (
    <div className="cpl-page">
      <div className="cpl-inner">
        <div className="cpl-header">
          <h2>My Coaching Plans</h2>
          <p>
            Plans you publish here will appear on your public profile for
            clients to subscribe to.
          </p>
        </div>

        {error && <div className="cpl-error">{error}</div>}

        {/* Create form */}
        <div className="cpl-card">
          <h3 className="cpl-card-title">Create New Plan</h3>
          <form className="cpl-form" onSubmit={handleCreate}>
            <input
              className="cpl-input"
              placeholder="Plan title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              className="cpl-input"
              type="number"
              placeholder="Duration (days) *"
              value={form.plan_duration}
              onChange={(e) =>
                setForm({ ...form, plan_duration: e.target.value })
              }
              required
              min="1"
            />
            <input
              className="cpl-input"
              type="number"
              placeholder="Price ($) *"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              min="0"
              step="0.01"
            />
            <select
              className="cpl-input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <textarea
              className="cpl-input cpl-textarea"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
            <button
              className="cpl-btn-primary"
              type="submit"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Plan"}
            </button>
          </form>
        </div>

        {/* Plans table */}
        <div className="cpl-card">
          <h3 className="cpl-card-title">Your Plans</h3>
          {loading ? (
            <p className="cpl-empty">Loading...</p>
          ) : plans.length === 0 ? (
            <p className="cpl-empty">No plans yet. Create one above.</p>
          ) : (
            <div className="cpl-table-wrap">
              <table className="cpl-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr
                      key={plan.plan_id}
                      className={!plan.is_active ? "cpl-row-inactive" : ""}
                    >
                      {editId === plan.plan_id ? (
                        <>
                          <td>
                            <input
                              className="cpl-input cpl-inline-input"
                              value={editForm.title}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  title: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="cpl-input cpl-inline-input"
                              type="number"
                              value={editForm.plan_duration}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  plan_duration: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="cpl-input cpl-inline-input"
                              type="number"
                              value={editForm.price}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  price: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>—</td>
                          <td className="cpl-actions">
                            <button
                              className="cpl-btn-save"
                              onClick={() => handleSaveEdit(plan.plan_id)}
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="cpl-btn-cancel"
                              onClick={() => setEditId(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{plan.title}</td>
                          <td>{plan.plan_duration} days</td>
                          <td>
                            ${Number(plan.price).toFixed(2)} {plan.currency}
                          </td>
                          <td>
                            <span
                              className={`cpl-status-pill ${
                                plan.is_active ? "active" : "inactive"
                              }`}
                            >
                              {plan.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="cpl-actions">
                            <button
                              className="cpl-btn-edit"
                              onClick={() => startEdit(plan)}
                            >
                              Edit
                            </button>
                            {plan.is_active && (
                              <button
                                className="cpl-btn-deactivate"
                                onClick={() => handleDeactivate(plan.plan_id)}
                              >
                                Deactivate
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoachPlans;
