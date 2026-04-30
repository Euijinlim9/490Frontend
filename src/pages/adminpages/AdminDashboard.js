import React from "react";
import "../../styles/Dashboard.css";
import "../../styles/AdminDashboard.css";

function AdminDashboard(){
    //const {user, activeRole} = useContext(AuthContext);
    return(
        <div className="dashboard-page">
            <div className="dashboard-layout">
            <section className="dashboard-section">
                <div className="dashboard-left">
                    <h2>Your Admin Dashboard</h2>
                    <div className="payment-card">
                    <h4>User Engagements</h4>
                    <button className="stat-btn">Daily</button>
                    <button className="stat-btn">Weekly</button>
                    <button className="stat-btn">Monthly</button>
                    </div>
            <div className="widget-card">
                <h4>Payment Reports</h4>
            </div>
            </div>
            </section>

            <section className="dashboard-section">
                <div className="dashboard-right">
            <div className="widget-card">
                <h4>New Coach Applications</h4>
            </div>
            <div className="widget-card">
                <h4>New Users</h4>
            </div>
            <div className="widget-card">
                <h4>New Coach Reports</h4>
            </div>
            </div>
            </section>
            </div>
        </div>
    )
}

export default AdminDashboard;