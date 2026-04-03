import React from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  // User data
  const { user } = useContext(AuthContext);

  // temporary sample data

  const quickActions = {
    workoutPath: "/workouts",
    mealPath: "/logs",
  };

  const todaysWorkout = {
    title: "Guided Cardio",
    level: "Intermediate",
    duration: 60,
    caloriesBurn: 350,
    streak: 28,
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  };

  const stats = {
    calories: {
      current: 896,
      goal: 1750,
    },
    activity: {
      current: 12,
      goal: 120,
    },
  };

  const wellness = {
    sleepHours: 6,
    waterCurrent: 20,
    waterGoal: 72,
    heartRate: 60,
  };

  const macros = {
    dateLabel: "Mar 5th",
    totalCalories: 896,
    protein: 30,
    carbs: 21,
    fats: 23,
  };

  const weightData = [
    { label: "Mar 1", value: 176 },
    { label: "Mar 7", value: 173.5 },
    { label: "Mar 14", value: 174.2 },
    { label: "Mar 21", value: 170 },
    { label: "Mar 28", value: 170 },
    { label: "Apr 4", value: 169.8 },
  ];

  const calendarWidget = {
    monthLabel: "March 2026",
    weekdayLabel: "Monday",
    selectedDay: 26,
    days: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ],
  };

  const caloriesPercent = Math.min(
    (stats.calories.current / stats.calories.goal) * 100,
    100
  );

  const activityPercent = Math.min(
    (stats.activity.current / stats.activity.goal) * 100,
    100
  );

  const macroTotal = macros.protein + macros.carbs + macros.fats;

  const proteinPercent = macroTotal ? (macros.protein / macroTotal) * 100 : 0;
  const carbsPercent = macroTotal ? (macros.carbs / macroTotal) * 100 : 0;
  const fatsPercent = macroTotal ? (macros.fats / macroTotal) * 100 : 0;

  const macrosGradient = `conic-gradient(
    #54c4f2 0% ${proteinPercent}%,
    #506a92 ${proteinPercent}% ${proteinPercent + carbsPercent}%,
    #6ca6ff ${proteinPercent + carbsPercent}% 100%
  )`;

  const minWeight = Math.min(...weightData.map((point) => point.value));
  const maxWeight = Math.max(...weightData.map((point) => point.value));
  const range = maxWeight - minWeight || 1;

  return (
    <div className="dashboard-page">
      <div className="dashboard-layout">
        <div className="dashboard-left">
          <h1>Welcome {user?.first_name}!</h1>

          <section className="dashboard-section">
            <h3 className="section-title">Quick Start</h3>
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
            <h3 className="section-title">Today's Workout</h3>
            <div className="dashboard-card workout-card">
              <div className="workout-image">
                <img src={todaysWorkout.image} alt={todaysWorkout.title} />
              </div>

              <div className="workout-info">
                <div className="workout-header-row">
                  <div>
                    <h4 className="workout-title">{todaysWorkout.title}</h4>
                  </div>
                  <span className="workout-level">{todaysWorkout.level}</span>
                </div>

                <div className="workout-meta">
                  <span>{todaysWorkout.duration} Minutes</span>
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
            <div className="dashboard-card stats-card">
              <div className="stat-block">
                <div className="stat-header">
                  <span className="stat-title">Calories</span>
                  <span className="stat-number">
                    {stats.calories.current.toLocaleString()}/
                    {stats.calories.goal.toLocaleString()}
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
                    {stats.activity.current}/{stats.activity.goal}
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
                <div className="health-icon">☾</div>
                <p className="health-value">
                  {wellness.sleepHours} <span>hours</span>
                </p>
              </div>

              <div className="health-card">
                <h4 className="health-title">Water</h4>
                <div className="health-icon">💧</div>
                <p className="health-value">
                  {wellness.waterCurrent}
                  <span>/{wellness.waterGoal}</span>
                </p>
                <p className="health-subtext">ounces</p>
              </div>

              <div className="health-card">
                <h4 className="health-title">Heart Rate</h4>
                <div className="health-icon">♡</div>
                <p className="health-value">
                  {wellness.heartRate} <span>bpm</span>
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="dashboard-right">
          <div className="analytics-row">
            <div className="widget-card macros-card">
              <div className="widget-header">
                <h4>Macros</h4>
                <span>{macros.dateLabel}</span>
              </div>

              <div className="macro-donut-wrap">
                <div
                  className="macro-donut"
                  style={{ background: macrosGradient }}
                >
                  <div className="macro-donut-inner">
                    <span>{macros.totalCalories}</span>
                  </div>
                </div>
              </div>

              <div className="macro-legend">
                <div className="macro-item">
                  <span className="macro-dot protein-dot"></span>
                  <div>
                    <strong>{macros.protein}g</strong>
                    <p>Protein</p>
                  </div>
                </div>

                <div className="macro-item">
                  <span className="macro-dot carbs-dot"></span>
                  <div>
                    <strong>{macros.carbs}g</strong>
                    <p>Carbs</p>
                  </div>
                </div>

                <div className="macro-item">
                  <span className="macro-dot fats-dot"></span>
                  <div>
                    <strong>{macros.fats}g</strong>
                    <p>Fats</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="widget-card weight-card">
              <div className="widget-header">
                <h4>Weight (lbs)</h4>
              </div>

              <div className="weight-chart">
                <div className="y-axis-labels">
                  {[180, 175, 170, 165, 160, 155].map((tick) => (
                    <span key={tick}>{tick}</span>
                  ))}
                </div>

                <div className="chart-area">
                  {[180, 175, 170, 165, 160, 155].map((tick) => (
                    <div key={tick} className="chart-grid-line"></div>
                  ))}

                  <svg
                    className="weight-line-svg"
                    viewBox="0 0 260 150"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      fill="none"
                      stroke="#3b5f8f"
                      strokeWidth="3"
                      points={weightData
                        .map((point, index) => {
                          const x =
                            weightData.length === 1
                              ? 130
                              : (index / (weightData.length - 1)) * 240 + 10;

                          const y =
                            10 + ((maxWeight - point.value) / range) * 110;

                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                    {weightData.map((point, index) => {
                      const x =
                        weightData.length === 1
                          ? 130
                          : (index / (weightData.length - 1)) * 240 + 10;

                      const y = 10 + ((maxWeight - point.value) / range) * 110;

                      return (
                        <circle
                          key={point.label}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#355a8c"
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>

                  <div className="x-axis-labels">
                    {weightData.map((point) => (
                      <span key={point.label}>{point.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="calendar-section">
            <div className="calendar-widget">
              <div className="calendar-left">
                <div className="calendar-top-row">
                  <button className="calendar-arrow">‹</button>
                  <span>{calendarWidget.monthLabel}</span>
                  <button className="calendar-arrow">›</button>
                </div>

                <p className="calendar-weekday">
                  {calendarWidget.weekdayLabel}
                </p>
                <h2 className="calendar-day-number">
                  {calendarWidget.selectedDay}
                </h2>
              </div>

              <div className="calendar-right">
                <div className="calendar-days-grid">
                  {calendarWidget.days.map((day) => {
                    const isSelected = day === calendarWidget.selectedDay;

                    return (
                      <div
                        key={day}
                        className={`calendar-day ${
                          isSelected ? "selected-day" : ""
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
