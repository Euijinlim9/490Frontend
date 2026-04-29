import { Link } from "react-router-dom";


function CoachDashboardView({
  user,
  pendingRequests,
  activeClients,
  loading,
  onApprove,
  onReject,
  onDropClient, 
  getTimeAgo,
}) {
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
        </div>
      </div>

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
                <div className="coach-client-actions">
                  <Link
                    to={`/coach/client/${client.user_id}`}
                    className="coach-client-view"
                  >
                    View Details 
                  </Link>

                  <button
                    className="coach-client-drop"
                    onClick={() => onDropClient(client.user_id, client.first_name)}
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

export default CoachDashboardView;
