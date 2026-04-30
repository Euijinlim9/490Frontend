import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import "../../styles/Dashboard.css";
import "../../styles/AdminDashboard.css";

function AdminDashboard(){
    const [revenueData, setRevenueData] = useState([]);
    const [pendingCoaches, setPendingCoaches] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [engagementData, setEngagementData] = useState([]);
    const [range, setRange] = useState("weekly");

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchData = async () => {
            try {
                const res1 = await fetch("http://localhost:4000/admin/pending?role=coach", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data1 = await res1.json();
                
                const res2 = await fetch("http://localhost:4000/admin/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data2 = await res2.json();
                const res3 = await fetch("http://localhost:4000/admin/reports/coach", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data3 = await res3.json();
                
                setReports(data3.reports || []);
                setPendingCoaches(data1.pending || []);
                setUsers(data2.users || []);
            
            } catch (err) {
                console.error(err);
            }
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        const fetchEngagement = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                    `http://localhost:4000/admin/stats/user-engagement?range=${range}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();

                if (!res.ok) throw new Error (data.error || "Fetch Failed");

                const labels = data?.labels || [];
                const values = data?.active_users || [];

                const formatted = labels.map((label, i) => ({
                    name: label,
                    active: values[i] ?? 0,
                }));

                setEngagementData(formatted);
            } catch (err) {
                console.error("Engagement fetch failed:", err);
                setEngagementData([]);
            }
    };

    fetchEngagement();
}, [range]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchRevenue = async () => {
        try {
            const res = await fetch(
                "http://localhost:4000/admin/stats/revenue/daily",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            
            const formatted = (data || []).map((item) => ({
                name: item.date,
                revenue: Number(item.revenue),
            }));
            
            setRevenueData(formatted);
        } catch (err) {
            console.error("Revenue fetch failed:", err);
            setRevenueData([]);
        }
    };
    fetchRevenue();
}, []);

    const isWithinLastWeek = (date) => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 7);

    return new Date(date) >= past;
    };

    const recentCoaches = pendingCoaches.filter(c =>
        isWithinLastWeek(c.created_at)
    );

    const recentUsers = users.filter(u =>
        isWithinLastWeek(u.created_at)
    );

    const recentReports = reports.filter(r =>
        isWithinLastWeek(r.created_at)
    );

    return(
        <div className="dashboard-page">
            <h1>Your Admin Dashboard</h1>
            <div className="stats-row">
                <div className="stat-card">
                    <Link to="/admin/coachapp" className="stat-link">
                    <h1>{recentCoaches.length} New Applications</h1>
                    <p>This Week</p>
                    </Link>
                </div>
                <div className="stat-card">
                    <Link to="/admin/viewusers" className="stat-link">
                    <h1>{recentUsers.length} New Users</h1>
                    <p>This Week</p>
                    </Link>
                </div>

                <div className="stat-card">
                    <Link to="/admin/userreport" className="stat-link">
                    <h1>{recentReports.length} Reports</h1>
                    <p>This Week</p>
                    </Link>
                </div>
                <div className="stat-card">
                    <Link to="/admin/viewusers" className="stat-link">
                    <h1>{users.length}</h1>
                    <p>Total Users</p>
                    </Link>
                </div>
            </div>
            <div className="admin-dashboard-layout">
            <section className="admin-dashboard-section">
                <div className="admin-dashboard-left">
                    <div className="payment-card">
                    <h4>User Engagements</h4>
                    <div className="user-engage-section">
                    <button 
                    className={`stat-btn ${range ==="daily" ? "active" : ""}`}
                    onClick={() => setRange("daily")}
                    >
                        Daily
                    </button>
                    <button 
                    className={`stat-btn ${range ==="weekly" ? "active" : ""}`}
                    onClick={() => setRange("weekly")}
                    >
                        Weekly
                    </button>
                    <button 
                    className={`stat-btn ${range ==="monthly" ? "active" : ""}`}
                    onClick={() => setRange("monthly")}
                    >
                        Monthly
                    </button>
                    </div>
                    <div className="admin-dash-chart">
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={engagementData}
                            margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                type="monotone"
                                dataKey="active"
                                stroke="#4f46e5"
                                strokeWidth={2}
                                dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    </div>
                    </div>
                    </section>
                    <section className="admin-dashboard-section">
                    <div className="admin-dashboard-right">
            <div className="widget-card">
                <h4>Total Revenue Overview</h4>
                <div className="admin-dash-paychart">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            />
                        </LineChart>
                        </ResponsiveContainer> 

                </div>
            </div>
            </div>
            </section>
            </div>
        </div>
    )
}

export default AdminDashboard;