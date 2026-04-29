import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function CoachDashboardView({
  user,
  pendingRequests,
  activeClients,
  loading,
  onApprove,
  onReject,
  getTimeAgo,
}) {
  const navigate = useNavigate();
  const { activeRole } = useContext(AuthContext);
  const [earnings, setEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "http://localhost:4000/api/coach/plans/earnings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Active-Role": activeRole,
            },
          }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEarnings(data);
      } catch {
        setEarnings(null);
      } finally {
        setEarningsLoading(false);
      }
    };
    fetchEarnings();
  }, [activeRole]);

  return (
    <div className="coach-dash">
      <div className="coach-dash-header">
        <div>
          <h1 className="coach-dash-title">
            Welcome back, Coach {user?.last_name}
          </h1>
          <p className="coach-dash-subtitle">
            Here's what's happening with your coaching business today.
          </p>
        </div>

        <div className="coach-dash-stats">
          <div className="coach-stat-pill">
            <span className="coach-stat-num">{pendingRequests.length}</span>
            <span className="coach-stat-lbl">Pending</span>
          </div>
          <div className="coach-stat-pill">
            <span className="coach-stat-num">{activeClients.length}</span>
            <span className="coach-stat-lbl">Active Clients</span>
          </div>
          <div className="coach-stat-pill">
            <span className="coach-stat-num">
              ${earningsLoading ? "—" : earnings?.monthTotal?.toFixed(0) ?? "0"}
            </span>
            <span className="coach-stat-lbl">This Month</span>
          </div>
          <div className="coach-stat-pill">
            <span className="coach-stat-num">
              ${earningsLoading ? "—" : earnings?.total?.toFixed(0) ?? "0"}
            </span>
            <span className="coach-stat-lbl">Total Earned</span>
          </div>
        </div>
      </div>

      {/* Earnings Widget */}
      <section className="coach-dash-section">
        <div className="coach-section-head">
          <h2>Earnings</h2>
        </div>

        {earningsLoading ? (
          <p className="coach-dash-muted">Loading earnings...</p>
        ) : !earnings || earnings.transactionCount === 0 ? (
          <div className="coach-empty">
            <div className="coach-empty-icon">💰</div>
            <h3>No earnings yet</h3>
            <p>
              Earnings will appear here once clients subscribe to your plans.
            </p>
          </div>
        ) : (
          <div className="coach-earnings-grid">
            {/* Bar chart */}
            <div className="coach-earnings-chart">
              <p className="coach-earnings-chart-title">
                Revenue — Last 6 Months
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={earnings.monthly}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#8a909a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8a909a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a1d24",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(v) => [`$${v.toFixed(2)}`, "Revenue"]}
                  />
                  <Bar dataKey="amount" fill="#6ca6ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-plan breakdown */}
            <div className="coach-earnings-breakdown">
              <p className="coach-earnings-chart-title">By Plan</p>
              {earnings.byPlan.map((p) => (
                <div key={p.title} className="coach-earnings-row">
                  <span className="coach-earnings-plan">{p.title}</span>
                  <span className="coach-earnings-amount">
                    ${p.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="coach-earnings-total-row">
                <span>Total</span>
                <span>${earnings.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Pending Requests */}
      <section className="coach-dash-section">
        <div className="coach-section-head">
          <h2>Pending Requests</h2>
          {pendingRequests.length > 0 && (
            <span className="coach-badge-red">{pendingRequests.length}</span>
          )}
        </div>

        {loading && <p className="coach-dash-muted">Loading requests...</p>}

        {!loading && pendingRequests.length === 0 && (
          <div className="coach-empty">
            <div className="coach-empty-icon">📬</div>
            <h3>No pending requests</h3>
            <p>New client requests will appear here.</p>
          </div>
        )}

        {!loading && pendingRequests.length > 0 && (
          <div className="coach-req-list">
            {pendingRequests.map((req) => (
              <div key={req.relationship_id} className="coach-req-card">
                <img
                  src={req.client.profile_pic || "/default-avatar.png"}
                  alt={req.client.first_name}
                  className="coach-req-avatar"
                />
                <div className="coach-req-body">
                  <div className="coach-req-top">
                    <div>
                      <h4 className="coach-req-name">
                        {req.client.first_name} {req.client.last_name}
                      </h4>
                      <p className="coach-req-time">
                        Requested {getTimeAgo(req.requested_at)}
                      </p>
                    </div>
                    <div className="coach-req-actions">
                      <button
                        className="coach-btn-approve"
                        onClick={() =>
                          onApprove(req.client.user_id, req.client.first_name)
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="coach-btn-reject"
                        onClick={() =>
                          onReject(req.client.user_id, req.client.first_name)
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  <div className="coach-req-survey">
                    {req.client.goal && (
                      <div className="coach-req-field">
                        <span className="coach-req-field-label">Goal</span>
                        <span className="coach-req-field-value">
                          {req.client.goal}
                        </span>
                      </div>
                    )}
                    {req.client.type_workout && (
                      <div className="coach-req-field">
                        <span className="coach-req-field-label">
                          Workout Style
                        </span>
                        <span className="coach-req-field-value">
                          {req.client.type_workout}
                        </span>
                      </div>
                    )}
                    {req.client.current_activity && (
                      <div className="coach-req-field">
                        <span className="coach-req-field-label">Activity</span>
                        <span className="coach-req-field-value">
                          {req.client.current_activity}
                        </span>
                      </div>
                    )}
                    {req.client.coach_help && (
                      <div className="coach-req-field">
                        <span className="coach-req-field-label">
                          Looking for
                        </span>
                        <span className="coach-req-field-value">
                          {req.client.coach_help}
                        </span>
                      </div>
                    )}
                    {!req.client.goal &&
                      !req.client.type_workout &&
                      !req.client.current_activity &&
                      !req.client.coach_help && (
                        <p className="coach-dash-muted">
                          This client hasn't completed their survey yet.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Clients */}
      <section className="coach-dash-section">
        <div className="coach-section-head">
          <h2>My Clients</h2>
        </div>

        {!loading && activeClients.length === 0 && (
          <div className="coach-empty">
            <div className="coach-empty-icon">👥</div>
            <h3>No active clients yet</h3>
            <p>Approved clients will appear here.</p>
          </div>
        )}

        {activeClients.length > 0 && (
          <div className="coach-clients-grid">
            {activeClients.map((client) => (
              <div key={client.user_id} className="coach-client-card">
                <img
                  src={client.profile_pic || "/default-avatar.png"}
                  alt={client.first_name}
                  className="coach-client-avatar"
                />
                <h4>
                  {client.first_name} {client.last_name}
                </h4>
                <p className="coach-client-since">
                  {client.start_date
                    ? `Client since ${new Date(
                        client.start_date
                      ).toLocaleDateString()}`
                    : "Recently joined"}
                </p>
                <button
                  className="coach-client-view"
                  onClick={() => navigate(`/coach/clients/${client.user_id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CoachDashboardView;
