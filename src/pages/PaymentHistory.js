import React from "react";
import { Link } from "react-router-dom";
import "../styles/PaymentHistory.css";

function PaymentHistory() {
  return (
    <div className="history-page">
      <div className="history-header">
        <Link to="/payments" className="back-btn">← Back to Payments</Link>
        <h2 className="history-title">Payment History</h2>
      </div>

      <div className="history-panel">
        <p className="history-empty">No transactions yet. Payment history will appear here once transactions are made.</p>
      </div>
    </div>
  );
}

export default PaymentHistory;
