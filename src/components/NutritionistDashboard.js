import { Link } from "react-router-dom";


function NutritionistDashboardView({
  user,
  pendingRequests,
  activeClients,
  loading,
  onApprove,
  onReject,
  onDropClient,
  getTimeAgo,
  upcomingBookings = [],
}) {

  return (
    <div className="coach-dash">
      <div className="coach-dash-header">
        <div>
          <h1 className="coach-dash-title">
            Welcome back, {user?.first_name} {user?.last_name}
          </h1>
          <p className="coach-dash-subtitle">
            Here's what's happening with your nutrition practice today.
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
        </div>
      </div>

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
                    {req.client.diet_preference && (
                      <div className="coach-req-field">
                        <span className="coach-req-field-label">
                          Diet Preference
                        </span>
                        <span className="coach-req-field-value">
                          {req.client.diet_preference}
                        </span>
                      </div>
                    )}
                    {req.client.dietary_restrictions && (
                      <div className="coach-req-field">
                        <span className="coach-req-field-label">
                          Restrictions
                        </span>
                        <span className="coach-req-field-value">
                          {req.client.dietary_restrictions}
                        </span>
                      </div>
                    )}
                    {req.client.nutritionist_help && (
                      <div className="coach-req-field">
                        <span className="coach-req-field-label">
                          Looking for
                        </span>
                        <span className="coach-req-field-value">
                          {req.client.nutritionist_help}
                        </span>
                      </div>
                    )}
                    {!req.client.goal &&
                      !req.client.diet_preference &&
                      !req.client.dietary_restrictions &&
                      !req.client.nutritionist_help && (
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

      {upcomingBookings && upcomingBookings.length > 0 && (
        <section className="coach-dash-section">
          <div className="coach-section-head">
            <h2>Upcoming Consultations</h2>
            <span className="coach-badge-blue">{upcomingBookings.length}</span>
          </div>
          <div className="coach-upcoming-list">
            {upcomingBookings.slice(0, 5).map((b) => {
              const start = new Date(b.start_time);
              const dateLabel = start.toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const timeLabel = start.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              });
              const isToday =
                start.toDateString() === new Date().toDateString();
              const isTomorrow =
                start.toDateString() ===
                new Date(Date.now() + 86400000).toDateString();

              return (
                <div key={b.booking_id} className="coach-upcoming-row">
                  <div className="coach-upcoming-date">
                    <div className="coach-upcoming-date-pill">
                      {isToday ? "Today" : isTomorrow ? "Tomorrow" : dateLabel}
                    </div>
                    <div className="coach-upcoming-time">{timeLabel}</div>
                  </div>
                  <img
                    src={b.client?.profile_pic || "/default-avatar.png"}
                    alt={b.client?.first_name}
                    className="coach-upcoming-avatar"
                  />
                  <div className="coach-upcoming-info">
                    <div className="coach-upcoming-name">
                      {b.client?.first_name} {b.client?.last_name}
                    </div>
                    <div className="coach-upcoming-meta">
                      {b.duration_minutes} min consultation
                      {b.client_notes && (
                        <span className="coach-upcoming-note">
                          {" "}
                          · note: "{b.client_notes.slice(0, 60)}
                          {b.client_notes.length > 60 ? "…" : ""}"
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/nutritionist/client/${b.client?.user_id}`}
                    className="coach-upcoming-view"
                  >
                    View →
                  </Link>
                </div>
              );
            })}
            {upcomingBookings.length > 5 && (
              <div className="coach-upcoming-more">
                +{upcomingBookings.length - 5} more consultations
              </div>
            )}
          </div>
        </section>
      )}

      <section className="coach-dash-section">
        <div className="coach-section-head">
          <h2>My Clients</h2>
        </div>

        {!loading && activeClients.length === 0 && (
          <div className="coach-empty">
            <div className="coach-empty-icon">🥗</div>
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
                <div className="coach-client-actions">
                  <Link
                    to={`/nutritionist/client/${client.user_id}`}
                    className="coach-client-view"
                  >
                    View Details
                  </Link>
                  <button
                    className="coach-client-drop"
                    onClick={() =>
                      onDropClient(client.user_id, client.first_name)
                    }
                  >
                    Drop Client
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default NutritionistDashboardView;