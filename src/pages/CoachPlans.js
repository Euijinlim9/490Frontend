import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/CoachPlans.css";
import { buildBackendUrl } from "../config/api";

function CoachPlans() {
  const [activeTab, setActiveTab] = useState("plans");

  return (
    <div className="cpl-page">
      <div className="cpl-inner">
        <div className="cpl-header">
          <h2>My Offerings</h2>
          <p>
            Manage subscription plans and session packages. Anything you publish
            here will appear on your public profile for clients to subscribe to
            or purchase.
          </p>
        </div>

        {/* Tab pills */}
        <div className="cpl-tabs">
          <button
            className={`cpl-tab ${activeTab === "plans" ? "active" : ""}`}
            onClick={() => setActiveTab("plans")}
          >
            Plans
          </button>
          <button
            className={`cpl-tab ${activeTab === "packages" ? "active" : ""}`}
            onClick={() => setActiveTab("packages")}
          >
            Session Packages
          </button>
        </div>

        {activeTab === "plans" ? <PlansTab /> : <PackagesTab />}
      </div>
    </div>
  );
}

// =============================================================================
// PLANS TAB — your teammate's existing CRUD, unchanged
// =============================================================================
const EMPTY_PLAN_FORM = {
  title: "",
  plan_duration: "",
  price: "",
  currency: "USD",
  description: "",
};

function PlansTab() {
  const { activeRole } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_PLAN_FORM);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "X-Active-Role": activeRole,
    }),
    [activeRole]
  );

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildBackendUrl("/api/coach/plans"), {
        headers,
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
      const res = await fetch(buildBackendUrl("/api/coach/plans"), {
        method: "POST",
        headers,
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
      setForm(EMPTY_PLAN_FORM);
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
        buildBackendUrl(`/api/coach/plans/${planId}`),
        {
          method: "PATCH",
          headers,
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
        buildBackendUrl(`/api/coach/plans/${planId}`),
        {
          method: "DELETE",
          headers,
        }
      );
      if (!res.ok) throw new Error();
      fetchPlans();
    } catch {
      alert("Could not deactivate plan.");
    }
  };

  return (
    <>
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
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          <button className="cpl-btn-primary" type="submit" disabled={creating}>
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
    </>
  );
}

function PackagesTab() {
  const { user, activeRole } = useContext(AuthContext);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "X-Active-Role": activeRole,
    }),
    [activeRole]
  );

  const [packages, setPackages] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newCount, setNewCount] = useState("");
  const [newDiscount, setNewDiscount] = useState("0");
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCount, setEditCount] = useState("");
  const [editDiscount, setEditDiscount] = useState("");

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildBackendUrl("/api/coach/packages"), {
        headers,
      });
      if (!res.ok) throw new Error("Could not load packages");
      const data = await res.json();
      setPackages(data.packages || []);

      if (user?.user_id) {
        const pubRes = await fetch(
          buildBackendUrl(`/api/coaches/${user.user_id}/packages`)
        );
        if (pubRes.ok) {
          const pubData = await pubRes.json();
          setHourlyRate(pubData.hourly_rate);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [headers, user]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const computePrice = (sessions, discount) => {
    if (!hourlyRate) return null;
    const base = hourlyRate * sessions;
    return base * (1 - discount / 100);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newCount) {
      alert("Name and session count are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(buildBackendUrl("/api/coach/packages"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: newName.trim(),
          session_count: parseInt(newCount),
          discount_percent: parseFloat(newDiscount) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setNewName("");
      setNewCount("");
      setNewDiscount("0");
      fetchPackages();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (pkg) => {
    setEditingId(pkg.package_id);
    setEditName(pkg.name);
    setEditCount(pkg.session_count.toString());
    setEditDiscount(pkg.discount_percent.toString());
  };

  const handleSaveEdit = async (packageId) => {
    try {
      const res = await fetch(
        buildBackendUrl(`/api/coach/packages/${packageId}`),
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            name: editName.trim(),
            session_count: parseInt(editCount),
            discount_percent: parseFloat(editDiscount) || 0,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setEditingId(null);
      fetchPackages();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeactivate = async (packageId) => {
    if (
      !window.confirm(
        "Deactivate this package? Clients won't be able to buy it."
      )
    )
      return;
    try {
      const res = await fetch(
        buildBackendUrl(`/api/coach/packages/${packageId}`),
        { method: "DELETE", headers }
      );
      if (!res.ok) throw new Error("Failed to deactivate");
      fetchPackages();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      {error && <div className="cpl-error">{error}</div>}

      {!hourlyRate && !loading && (
        <div className="cpl-warning">
          ⚠ Set your hourly rate on your profile before creating packages.
        </div>
      )}

      {/* Create form */}
      <div className="cpl-card">
        <h3 className="cpl-card-title">Create New Package</h3>
        <p className="cpl-hint">
          Prices auto-calculate from your hourly rate
          {hourlyRate ? ` ($${hourlyRate}/hr)` : " (not set yet)"}.
        </p>

        <div className="cpl-form-grid">
          <input
            className="cpl-input"
            placeholder="Package name (e.g. 5-Pack)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={100}
          />
          <input
            className="cpl-input"
            type="number"
            placeholder="Number of sessions"
            min="1"
            value={newCount}
            onChange={(e) => setNewCount(e.target.value)}
          />
          <input
            className="cpl-input"
            type="number"
            placeholder="Discount %"
            min="0"
            max="100"
            step="0.5"
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
          />
        </div>

        {newCount && hourlyRate && (
          <div className="cpl-preview">
            Preview: {newCount} × ${hourlyRate}
            {parseFloat(newDiscount) > 0 &&
              ` − ${newDiscount}% discount`} ={" "}
            <strong>
              $
              {computePrice(
                parseInt(newCount),
                parseFloat(newDiscount) || 0
              ).toFixed(2)}
            </strong>
          </div>
        )}

        <button
          className="cpl-btn-primary"
          onClick={handleCreate}
          disabled={creating || !hourlyRate}
        >
          {creating ? "Creating..." : "Create Package"}
        </button>
      </div>

      {/* Packages table */}
      <div className="cpl-card">
        <h3 className="cpl-card-title">Your Packages</h3>
        {loading ? (
          <p className="cpl-empty">Loading...</p>
        ) : packages.length === 0 ? (
          <p className="cpl-empty">No packages yet. Create one above.</p>
        ) : (
          <div className="cpl-table-wrap">
            <table className="cpl-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Sessions</th>
                  <th>Discount</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => {
                  const isEditing = editingId === pkg.package_id;
                  const price = computePrice(
                    isEditing ? parseInt(editCount) || 0 : pkg.session_count,
                    isEditing
                      ? parseFloat(editDiscount) || 0
                      : parseFloat(pkg.discount_percent)
                  );

                  return (
                    <tr
                      key={pkg.package_id}
                      className={!pkg.is_active ? "cpl-row-inactive" : ""}
                    >
                      {isEditing ? (
                        <>
                          <td>
                            <input
                              className="cpl-input cpl-inline-input"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              maxLength={100}
                            />
                          </td>
                          <td>
                            <input
                              className="cpl-input cpl-inline-input"
                              type="number"
                              min="1"
                              value={editCount}
                              onChange={(e) => setEditCount(e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="cpl-input cpl-inline-input"
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={editDiscount}
                              onChange={(e) => setEditDiscount(e.target.value)}
                            />
                            %
                          </td>
                          <td>
                            {price !== null ? `$${price.toFixed(2)}` : "—"}
                          </td>
                          <td>—</td>
                          <td className="cpl-actions">
                            <button
                              className="cpl-btn-save"
                              onClick={() => handleSaveEdit(pkg.package_id)}
                            >
                              Save
                            </button>
                            <button
                              className="cpl-btn-cancel"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{pkg.name}</td>
                          <td>{pkg.session_count}</td>
                          <td>
                            {parseFloat(pkg.discount_percent) > 0
                              ? `${pkg.discount_percent}%`
                              : "—"}
                          </td>
                          <td>
                            {price !== null ? `$${price.toFixed(2)}` : "—"}
                          </td>
                          <td>
                            <span
                              className={`cpl-status-pill ${
                                pkg.is_active ? "active" : "inactive"
                              }`}
                            >
                              {pkg.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="cpl-actions">
                            <button
                              className="cpl-btn-edit"
                              onClick={() => startEdit(pkg)}
                            >
                              Edit
                            </button>
                            {pkg.is_active && (
                              <button
                                className="cpl-btn-deactivate"
                                onClick={() => handleDeactivate(pkg.package_id)}
                              >
                                Deactivate
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default CoachPlans;
