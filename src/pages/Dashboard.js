import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const { user } = useContext(AuthContext);

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

  const [weightData, setWeightData] = useState([]);
  const [weightInput, setWeightInput] = useState("");

  const macros = {
    dateLabel: "Today",
    totalCalories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  const stats = {
    calories: {
      current: 0,
      goal: 1750,
    },
    activity: {
      current: 0,
      goal: 120,
    },
  };

  const caloriesPercent = Math.min(
    stats.calories.goal
      ? (stats.calories.current / stats.calories.goal) * 100
      : 0,
    100
  );

  const activityPercent = Math.min(
    stats.activity.goal
      ? (stats.activity.current / stats.activity.goal) * 100
      : 0,
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

  const chartData = useMemo(() => {
    return weightData;
  }, [weightData]);

  const minWeight = chartData.length
    ? Math.min(...chartData.map((p) => p.value))
    : 0;

  const maxWeight = chartData.length
    ? Math.max(...chartData.map((p) => p.value))
    : 0;

  const paddedMin = chartData.length ? Math.floor(minWeight - 3) : 0;
  const paddedMax = chartData.length ? Math.ceil(maxWeight + 3) : 10;
  const range = paddedMax - paddedMin || 1;

  const yAxisTicks = chartData.length
    ? Array.from({ length: 6 }, (_, i) =>
        Math.round(paddedMax - (i * range) / 5)
      )
    : [0, 0, 0, 0, 0, 0];

  const [currentMonth, setCurrentMonth] = useState(new Date());

const year = currentMonth.getFullYear();
const month = currentMonth.getMonth();

const today = new Date();

const daysInMonth = new Date(year, month + 1, 0).getDate();

const handlePrevMonth = () => {
  setCurrentMonth(new Date(year, month - 1, 1));
};

const handleNextMonth = () => {
  setCurrentMonth(new Date(year, month + 1, 1));
};

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!weightInput.trim()) return;

    const newEntry = {
      label: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: Number(weightInput),
    };

    if (!newEntry.value) return;

    setWeightData((prev) => [...prev, newEntry]);
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
      <div className="dashboard-layout">
        <div className="dashboard-left">
          <div className="welcome">Welcome {user?.first_name}!</div>

          <section className="dashboard-section">
            <div className="section-title">Today's Workout</div>
            <div className="dashboard-card workout-card">
              <div className="workout-image">
                <img src={todaysWorkout.image} alt={todaysWorkout.title} />
              </div>

              <div className="workout-info">
                <div className="workout-header-row">
                  <div>
                    <div className="workout-title">{todaysWorkout.title}</div>
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
  <div className="health-icon">💧</div>

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
    <>
      <p
        className="health-value clickable-value"
        onClick={() => startEditing("waterCurrent")}
      >
        {wellness.waterCurrent} <span>ounces</span>
      </p>
    </>
  )}
</div>

              <div className="health-card">
  <h4 className="health-title">Heart Rate</h4>
  <div className="health-icon">♡</div>

  {editingCard === "heartRate" ? (
    <input
      type="number"
      name="heartRate"
      value={wellnessInputs.heartRate}
      onChange={handleWellnessInputChange}
      onBlur={() => saveWellnessField("heartRate")}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          saveWellnessField("heartRate");
        }
      }}
      className="wellness-inline-input"
      autoFocus
    />
  ) : (
    <p
      className="health-value clickable-value"
      onClick={() => startEditing("heartRate")}
    >
      {wellness.heartRate} <span>bpm</span>
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

              <form onSubmit={handleAddWeight} className="dashboard-form">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                />
                <button type="submit" className="dash-btn">
                  Add Weight
                </button>
              </form>

              <div className="weight-chart">
                <div className="y-axis-labels">
                  {yAxisTicks.map((tick) => (
                    <span key={tick}>{tick}</span>
                  ))}
                </div>

                <div className="chart-area">
                  {yAxisTicks.map((tick) => (
                    <div key={tick} className="chart-grid-line"></div>
                  ))}

                  <svg
                    className="weight-line-svg"
                    viewBox="0 0 300 170"
                    preserveAspectRatio="none"
                  >
                    {chartData.length > 0 && (
                      <>
                        <polyline
                          fill="none"
                          stroke="#3b5f8f"
                          strokeWidth="3"
                          points={chartData
                            .map((point, index) => {
                              const x =
                                chartData.length === 1
                                  ? 150
                                  : (index / (chartData.length - 1)) * 260 + 20;

                              const y =
                                15 + ((paddedMax - point.value) / range) * 120;

                              return `${x},${y}`;
                            })
                            .join(" ")}
                        />

                        {chartData.map((point, index) => {
                          const x =
                            chartData.length === 1
                              ? 150
                              : (index / (chartData.length - 1)) * 260 + 20;

                          const y =
                            15 + ((paddedMax - point.value) / range) * 120;

                          return (
                            <circle
                              key={`${point.label}-${index}`}
                              cx={x}
                              cy={y}
                              r="5"
                              fill="#355a8c"
                              stroke="white"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </>
                    )}
                  </svg>

                  <div className="x-axis-labels">
                    {chartData.map((point, index) => (
                      <span key={`${point.label}-${index}`}>{point.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;