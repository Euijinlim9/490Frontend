import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import { AuthContext } from "../context/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

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

  const [weightInput, setWeightInput] = useState("");
  const [weightData, setWeightData] = useState([]);

  const[mealTotals, setMealTotals] = useState({
    totalCalories: 0, 
    protein: 0, 
    fiber: 0, 
    carbs: 0, 
    fats: 0,
  }); 

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

  const calorieGoal = 1750; 
  const caloriesPercent = Math.min(
    calorieGoal ? (mealTotals.totalCalories / calorieGoal) * 100 : 0,
    100
  );

  const [activityCurrent, setActivityCurrent] = useState(0); 

  useEffect(() => {
    const savedWorkouts = JSON.parse(localStorage.getItem("loggedWorkouts")) || [];
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

  const activityGoal = 120; 

  const activityPercent = Math.min(
    activityGoal ? (activityCurrent / activityGoal) * 100 : 0,
    100
  );

  const macroTotal = mealTotals.protein + mealTotals.fiber + mealTotals.carbs + mealTotals.fats;
  const proteinPercent = macroTotal ? (mealTotals.protein / macroTotal) * 100 : 0;
  const carbsPercent = macroTotal ? (mealTotals.carbs / macroTotal) * 100 : 0;
  const fatsPercent = macroTotal ? (mealTotals.fats / macroTotal) * 100 : 0;
  const fiberPercent = macroTotal ? (mealTotals.fiber / macroTotal) * 100 : 0;

  const macrosGradient = `conic-gradient(
    #54c4f2 0% ${proteinPercent}%,
    #506a92 ${proteinPercent}% ${proteinPercent + carbsPercent}%,
    #6ca6ff ${proteinPercent + carbsPercent}% 100%
  )`;

  const chartData = useMemo(() => {
    return weightData;
  }, [weightData]);

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!weightInput.trim()) return;

    const newEntry = {
      label: new Date().toISOString(),
      value: Number(weightInput),
    };

    if (Number.isNaN(newEntry.value)) return;

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
                <button type="submit" className="dash-btn">
                  Add Weight
                </button>
              </form>

              <div className="weight-chart-recharts">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                  >
                    <CartesianGrid stroke="rgba(255, 255, 255, 0.12)" vertical={false}/>
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#cfd6de", fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value); 
                        return `${date.getMonth() + 1}/${date.getDate()}`;  
                      }} 
                    />
                    <YAxis
                      domain={["dataMine -2", "dataMax +2"]}
                      tick={{ fill: "#cfd6de", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Line 
                      type="monotone"
                      dataKey="value"
                      stroke="#3b66a8"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#3b66a8", stroke: "white", strokeWidth: 2 }}
                    /> 
                  </LineChart>
                </ResponsiveContainer>
              </div> 
            </div> 
          </div> 
        </div> 
      </div> 
    </div>
  );
}

export default Dashboard;

//ENTRIES DO NOT STAY IN CHRONOLOGICAL ORDER
//MACROS ENTERED IN LOG NEED TO SHOW IN CHART ON DASH 