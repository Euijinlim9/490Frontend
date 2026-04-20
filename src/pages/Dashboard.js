import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import { AuthContext } from "../context/AuthContext";
import CoachDashboardView from "../components/CoachDashboardView";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import sleepIcon from "../images/sleep.svg";
import waterIcon from "../images/water.svg";

function Dashboard() {
  const { user, activeRole } = useContext(AuthContext);

  const [myCoach, setMyCoach] = useState({ state: "loading", coach: null });

  const fetchMyCoach = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/client/my-coach", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load coach!");
      const data = await res.json();
      setMyCoach(data);
    } catch (error) {
      console.error(error);
      setMyCoach({ state: "none", coach: null });
    }
  };

  useEffect(() => {
    if (activeRole === "client") {
      fetchMyCoach();
    }
  }, [activeRole]);

  const handleCancelRequest = async () => {
    if (!window.confirm("Cancel your request to this coach?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/coaches/request", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to cancel");
      setMyCoach({ state: "none", coach: null });
    } catch (error) {
      console.error(error);
      alert("Could not cancel request. Try again.");
    }
  };

  const quickActions = {
    workoutPath: "/workouts",
    mealPath: "/logs",
  };

  const todaysWorkout = {
    title: "",
    level: "",
    duration: "",
    caloriesBurn: "",
    streak: "",
    image: "",
  };

  const [wellness, setWellness] = useState({
    sleepHours: 0,
    waterCurrent: 0,
    waterGoal: 0,
    heartRate: 0,
  });

  const [editingCard, setEditingCard] = useState(null);

  const [wellnessInputs, setWellnessInputs] = useState({
    sleepHours: "",
    waterCurrent: "",
    waterGoal: "",
    heartRate: "",
  });

  const [weightInput, setWeightInput] = useState("");
  const [weightData, setWeightData] = useState([]);

  const [mealTotals, setMealTotals] = useState({
    totalCalories: 0,
    protein: 0,
    fiber: 0,
    carbs: 0,
    fats: 0,
  });

  const [calorieGoal, setCalorieGoal] = useState(1750);
  const [activityGoal, setActivityGoal] = useState(120);
  const [activityCurrent, setActivityCurrent] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [coachDataLoading, setCoachDataLoading] = useState(false);
  const [activeClients, setActiveClients] = useState([]);

  const fetchCoachData = async () => {
    setCoachDataLoading(true);
    const token = localStorage.getItem("token");
    try {
      const [requestsRes, clientsRes] = await Promise.all([
        fetch("http://localhost:4000/api/coach/requests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:4000/api/coach/clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setPendingRequests(data.data || []);
      }

      // clients endpoint is sprint B
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setActiveClients(data.data || []);
      } else {
        setActiveClients([]);
      }
    } catch (error) {
      console.error("Failed to fetch coach data:", error);
    } finally {
      setCoachDataLoading(false);
    }
  };
  useEffect(() => {
    if (activeRole === "coach") {
      fetchCoachData();
    }
  }, [activeRole]);

  const handleApproveRequest = async (clientUserId, clientName) => {
    if (!window.confirm(`Approve ${clientName} as a client?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/requests/${clientUserId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to approve");
      fetchCoachData();
    } catch (err) {
      console.error(err);
      alert("Could not approve request. Try again.");
    }
  };

  const handleRejectRequest = async (clientUserId, clientName) => {
    if (!window.confirm(`Reject ${clientName}'s request?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/requests/${clientUserId}/reject`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok && res.status !== 204) throw new Error("Failed to reject");
      fetchCoachData();
    } catch (err) {
      console.error(err);
      alert("Could not reject request. Try again.");
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  useEffect(() => {
    const savedWeightData =
      JSON.parse(localStorage.getItem("weightData")) || [];
    setWeightData(savedWeightData);
  }, []);

  useEffect(() => {
    const savedMeals = JSON.parse(localStorage.getItem("loggedMeals")) || [];
    const today = new Date().toLocaleDateString();

    const todaysMeals = savedMeals.filter((meal) => meal.date === today);

    const totals = todaysMeals.reduce(
      (acc, meal) => {
        acc.totalCalories += Number(meal.calories) || 0;
        acc.protein += Number(meal.protein) || 0;
        acc.carbs += Number(meal.carbs) || 0;
        acc.fats += Number(meal.fats) || 0;
        acc.fiber += Number(meal.fiber) || 0;
        return acc;
      },
      {
        totalCalories: 0,
        protein: 0,
        fiber: 0,
        carbs: 0,
        fats: 0,
      }
    );

    setMealTotals(totals);
  }, []);

  useEffect(() => {
    const savedSurvey =
      JSON.parse(localStorage.getItem("clientSurveyData")) || {};
    const savedDashboard =
      JSON.parse(localStorage.getItem("dashboardData")) || {};

    if (savedSurvey.calorieTarget) {
      setCalorieGoal(Number(savedSurvey.calorieTarget));
    } else if (savedDashboard.calorieTarget) {
      setCalorieGoal(Number(savedDashboard.calorieTarget));
    }

    if (savedSurvey.goalActivity) {
      setActivityGoal(Number(savedSurvey.goalActivity));
    } else if (savedDashboard.goalActivity) {
      setActivityGoal(Number(savedDashboard.goalActivity));
    }
  }, []);

  const caloriesPercent = Math.min(
    calorieGoal ? (mealTotals.totalCalories / calorieGoal) * 100 : 0,
    100
  );

  useEffect(() => {
    const savedWorkouts =
      JSON.parse(localStorage.getItem("loggedWorkouts")) || [];
    const today = new Date().toLocaleDateString();

    const todaysWorkouts = savedWorkouts.filter((workout) => {
      if (!workout.date) return false;

      const workoutDate = new Date(workout.date).toLocaleDateString();
      return workoutDate === today;
    });

    const totalMinutes = todaysWorkouts.reduce((acc, workout) => {
      acc += Number(workout.duration) || 0;
      return acc;
    }, 0);

    setActivityCurrent(totalMinutes);
  }, []);

  useEffect(() => {
    const savedWellness =
      JSON.parse(localStorage.getItem("loggedWellness")) || [];

    const today = new Date().toLocaleDateString();

    const todaysWellness = savedWellness.filter(
      (entry) => entry.date === today
    );

    const waterTotal = todaysWellness.reduce((acc, entry) => {
      return acc + (Number(entry.waterLog) || 0);
    }, 0);

    const latestEntry =
      todaysWellness.length > 0
        ? todaysWellness[todaysWellness.length - 1]
        : null;

    setWellness({
      sleepHours: latestEntry ? Number(latestEntry.hoursSlept) || 0 : 0,
      waterCurrent: waterTotal,
      waterGoal: 0,
      heartRate: latestEntry ? Number(latestEntry.heartRate) || 0 : 0,
    });
  }, []);

  const activityPercent = Math.min(
    activityGoal ? (activityCurrent / activityGoal) * 100 : 0,
    100
  );

  const macroTotal =
    mealTotals.protein + mealTotals.fiber + mealTotals.carbs + mealTotals.fats;

  const proteinPercent = macroTotal
    ? (mealTotals.protein / macroTotal) * 100
    : 0;
  const fiberPercent = macroTotal ? (mealTotals.fiber / macroTotal) * 100 : 0;
  const carbsPercent = macroTotal ? (mealTotals.carbs / macroTotal) * 100 : 0;
  const fatsPercent = macroTotal ? (mealTotals.fats / macroTotal) * 100 : 0;

  const macrosGradient = `conic-gradient(
    #54c4f2 0% ${proteinPercent}%,
    #8b5cf6 ${proteinPercent}% ${proteinPercent + fiberPercent}%,
    #506a92 ${proteinPercent + fiberPercent}% ${
    proteinPercent + fiberPercent + carbsPercent
  }%,
    #6ca6ff ${proteinPercent + fiberPercent + carbsPercent}% 100%
  )`;

  const chartData = useMemo(() => {
    const groupedByDay = {};

    weightData.forEach((entry) => {
      const dateObj = new Date(entry.label);
      const dayKey = dateObj.toLocaleDateString();

      // keep the latest entry for that day
      groupedByDay[dayKey] = {
        day: dayKey,
        value: Number(entry.value),
        fullDate: entry.label,
      };
    });

    return Object.values(groupedByDay);
  }, [weightData]);

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!weightInput.trim()) return;

    const newEntry = {
      label: new Date().toISOString(),
      value: Number(weightInput),
    };

    if (Number.isNaN(newEntry.value)) return;

    const updatedWeightData = [...weightData, newEntry];

    setWeightData(updatedWeightData);
    localStorage.setItem("weightData", JSON.stringify(updatedWeightData));
    setWeightInput("");
  };

  const startEditing = (field) => {
    setEditingCard(field);
    setWellnessInputs((prev) => ({
      ...prev,
      [field]: wellness[field],
    }));
  };

  const handleWellnessInputChange = (e) => {
    const { name, value } = e.target;
    setWellnessInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveWellnessField = (field) => {
    setWellness((prev) => ({
      ...prev,
      [field]: Number(wellnessInputs[field]) || 0,
    }));
    setEditingCard(null);
  };

  return (
    <div className="dashboard-page">
      {activeRole === "coach" ? (
        <CoachDashboardView
          user={user}
          pendingRequests={pendingRequests}
          activeClients={activeClients}
          loading={coachDataLoading}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          getTimeAgo={getTimeAgo}
        />
      ) : (
        <div className="dashboard-layout">
          <div className="dashboard-left">
            <div className="welcome">Welcome back, {user?.first_name}!</div>
            {activeRole === "client" && (
              <section className="dashboard-section">
                <div className="section-title">My Coach</div>
                <div className="dashboard-card my-coach-card">
                  {myCoach.state === "loading" && <p>Loading...</p>}

                  {myCoach.state === "none" && (
                    <div className="my-coach-empty">
                      <p>You don't have a coach yet.</p>
                      <Link to="/coach" className="dash-btn">
                        Browse coaches
                      </Link>
                    </div>
                  )}

                  {(myCoach.state === "pending" ||
                    myCoach.state === "active") &&
                    myCoach.coach && (
                      <div className="my-coach-info">
                        <img
                          src={
                            myCoach.coach.profile_pic || "/default-avatar.png"
                          }
                          alt={myCoach.coach.first_name}
                          className="my-coach-avatar"
                        />
                        <div className="my-coach-details">
                          <div className="my-coach-name-row">
                            <strong>
                              {myCoach.coach.first_name}{" "}
                              {myCoach.coach.last_name}
                            </strong>
                            <span className={`my-coach-badge ${myCoach.state}`}>
                              {myCoach.state === "pending"
                                ? "Request Pending"
                                : "Active"}
                            </span>
                          </div>
                          <p className="my-coach-specialization">
                            {myCoach.coach.specialization}
                          </p>
                          {myCoach.state === "pending" && (
                            <button
                              onClick={handleCancelRequest}
                              className="dash-btn cancel-btn"
                            >
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </section>
            )}

            <section className="dashboard-section">
              <div className="section-title">Today's Workout</div>
              <div className="dashboard-card workout-card">
                <div className="workout-image"></div>

                <div className="workout-info">
                  <div className="workout-header-row">
                    <div>
                      <div className="workout-title">{todaysWorkout.title}</div>
                    </div>
                    <span className="workout-level">{todaysWorkout.level}</span>
                  </div>

                  <div className="workout-meta">
                    <span>{todaysWorkout.duration} min</span>
                    <span>{todaysWorkout.caloriesBurn} kcal</span>
                  </div>

                  <div className="workout-footer">
                    <Link to="/workouts" className="start-workout-btn">
                      Start Workout
                    </Link>
                    <span className="streak-text">
                      {todaysWorkout.streak} day streak
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="dashboard-card quickstart-card">
                <Link to={quickActions.workoutPath} className="dash-btn">
                  Start a workout
                </Link>
                <Link to={quickActions.mealPath} className="dash-btn">
                  Log a meal
                </Link>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="dashboard-card stats-card">
                <div className="stat-block">
                  <div className="stat-header">
                    <span className="stat-title">Calories</span>
                    <span className="stat-number">
                      {mealTotals.totalCalories.toLocaleString()}/
                      {calorieGoal.toLocaleString()}
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${caloriesPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="stat-block">
                  <div className="stat-header">
                    <span className="stat-title">Activity Minutes</span>
                    <span className="stat-number">
                      {activityCurrent}/{activityGoal}
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${activityPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="health-row">
                <div className="health-card">
                  <h4 className="health-title">Sleep</h4>
                  <div className="health-icon">
                    <img src={sleepIcon} alt="sleep" />
                  </div>

                  {editingCard === "sleepHours" ? (
                    <input
                      type="number"
                      name="sleepHours"
                      value={wellnessInputs.sleepHours}
                      onChange={handleWellnessInputChange}
                      onBlur={() => saveWellnessField("sleepHours")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveWellnessField("sleepHours");
                        }
                      }}
                      className="wellness-inline-input"
                      autoFocus
                    />
                  ) : (
                    <p
                      className="health-value clickable-value"
                      onClick={() => startEditing("sleepHours")}
                    >
                      {wellness.sleepHours} <span>hours</span>
                    </p>
                  )}
                </div>

                <div className="health-card">
                  <h4 className="health-title">Water</h4>
                  <div className="health-icon">
                    <img src={waterIcon} alt="water" />
                  </div>

                  {editingCard === "waterCurrent" ? (
                    <input
                      type="number"
                      name="waterCurrent"
                      value={wellnessInputs.waterCurrent}
                      onChange={handleWellnessInputChange}
                      onBlur={() => saveWellnessField("waterCurrent")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveWellnessField("waterCurrent");
                        }
                      }}
                      className="wellness-inline-input"
                      autoFocus
                    />
                  ) : (
                    <p
                      className="health-value clickable-value"
                      onClick={() => startEditing("waterCurrent")}
                    >
                      {wellness.waterCurrent} <span>ounces</span>
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="dashboard-right">
            <div className="analytics-row">
              <div className="widget-card macros-card">
                <div className="widget-header">
                  <h4>Macros</h4>
                  <span>Today</span>
                </div>

                <div className="macro-donut-wrap">
                  <div
                    className="macro-donut"
                    style={{ background: macrosGradient }}
                  >
                    <div className="macro-donut-inner">
                      <span>{mealTotals.totalCalories}</span>
                    </div>
                  </div>
                </div>

                <div className="macro-legend">
                  <div className="macro-item">
                    <span className="macro-dot protein-dot"></span>
                    <div>
                      <strong>{mealTotals.protein}g</strong>
                      <p>Protein</p>
                    </div>
                  </div>

                  <div className="macro-item">
                    <span className="macro-dot fiber-dot"></span>
                    <div>
                      <strong>{mealTotals.fiber}g</strong>
                      <p>Fiber</p>
                    </div>
                  </div>

                  <div className="macro-item">
                    <span className="macro-dot carbs-dot"></span>
                    <div>
                      <strong>{mealTotals.carbs}g</strong>
                      <p>Carbs</p>
                    </div>
                  </div>

                  <div className="macro-item">
                    <span className="macro-dot fats-dot"></span>
                    <div>
                      <strong>{mealTotals.fats}g</strong>
                      <p>Fats</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="widget-card weight-card">
                <div className="widget-header">
                  <h4>Weight (lbs)</h4>
                </div>

                <form onSubmit={handleAddWeight} className="dashboard-form">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter weight"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                  />
                  <button type="submit" className="weight-btn">
                    Add Weight
                  </button>
                </form>

                <div className="weight-chart-recharts">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.12)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#cfd6de", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        domain={[
                          (dataMin) => Math.floor(dataMin - 2),
                          (dataMax) => Math.ceil(dataMax + 2),
                        ]}
                        tick={{ fill: "#cfd6de", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />

                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6ca6ff"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#6ca6ff",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
