import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/PaymentHistory.css";

function PaymentHistory() {
  const { activeRole } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:4000/api/client/payments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        });
        if (!res.ok) throw new Error("Failed to load payments");
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [activeRole]);

  return (
    <div className="history-page">
      <div className="history-header">
        <Link to="/payments" className="back-btn">
          ← Back to Payments
        </Link>
        <h2 className="history-title">Payment History</h2>
      </div>

      <div className="history-panel">
        {loading && <p className="history-empty">Loading...</p>}

        {!loading && error && <p className="history-empty">{error}</p>}

        {!loading && !error && payments.length === 0 && (
          <p className="history-empty">
            No transactions yet. Payment history will appear here once
            transactions are made.
          </p>
        )}

        {!loading && !error && payments.length > 0 && (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Coach</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.payment_id}>
                  <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td>{p.coachingPlan?.title || "—"}</td>
                  <td>
                    {p.coach
                      ? `${p.coach.first_name} ${p.coach.last_name}`
                      : "—"}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {p.payment_method}
                  </td>
                  <td>
                    ${Number(p.payment_amount).toFixed(2)} {p.currency}
                  </td>
                  <td>
                    <span
                      className={`history-status history-status-${p.payment_status}`}
                    >
                      {p.payment_status.charAt(0).toUpperCase() +
                        p.payment_status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;
