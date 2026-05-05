import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { WorkoutContext } from "../context/WorkoutContext";
import { useNavigate } from "react-router-dom";
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

function Dashboard() {
  const { user, activeRole } = useContext(AuthContext);
  const { setActiveWorkout } = useContext(WorkoutContext);
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const navigate = useNavigate();

  const [myCoach, setMyCoach] = useState({ state: "loading", coach: null });

  const fetchMyCoach = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/client/my-coach", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Active-Role": activeRole,
        },
      });
      if (!res.ok) throw new Error("Failed to load coach!");
      const data = await res.json();
      setMyCoach(data);
    } catch (error) {
      console.error(error);
      setMyCoach({ state: "none", coach: null });
    }
  }, [activeRole]);

  const fetchMySubscription = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/client/subscription", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Active-Role": activeRole,
        },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setSubLoading(false);
    }
  }, [activeRole]);

  useEffect(() => {
    if (activeRole === "client") fetchMySubscription();
  }, [activeRole, fetchMySubscription]);

  const handleCancelSubscription = async () => {
    if (
      !window.confirm(
        "Cancel your subscription? You'll keep access until the end date."
      )
    )
      return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:4000/api/subscriptions/${subscription.subscription_id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }
      );
      if (!res.ok) throw new Error();
      fetchMySubscription();
    } catch {
      alert("Could not cancel. Please try again.");
    }
  };

  useEffect(() => {
    if (activeRole === "client") {
      fetchMyCoach();
    }
  }, [activeRole, fetchMyCoach]);

  const [todayAssignment, setTodayAssignment] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [weekWorkouts, setWeekWorkouts] = useState([]);
  const [weekPersonalEvents, setWeekPersonalEvents] = useState([]);

  const fetchTodayAssignment = useCallback(async () => {
    if (activeRole !== "client") return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:4000/api/client/my-assigned-workouts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      const todayStr = new Date().toISOString().split("T")[0];
      const todays = (data.data || []).find((a) => a.due_date === todayStr);
      setTodayAssignment(todays || null);

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      const thisWeek = (data.data || []).filter((a) => {
        if (!a.due_date) return false;
        const d = new Date(a.due_date + "T00:00:00");
        return d >= startOfWeek && d <= endOfWeek;
      }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      setWeekWorkouts(thisWeek);

      const calRes = await fetch("http://localhost:4000/api/calendar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (calRes.ok) {
        const calData = await calRes.json();
        const thisWeekPersonal = (calData.data || []).filter((e) => {
          if (!e.date) return false;
          const d = new Date(e.date + "T00:00:00");
          return d >= startOfWeek && d <= endOfWeek;
        });
        setWeekPersonalEvents(thisWeekPersonal);
      }
    } catch (err) {
      console.error(err);
      setTodayAssignment(null);
      setWeekWorkouts([]);
    } finally {
      setTodayLoading(false);
    }
  }, [activeRole]);

  useEffect(() => {
    if (activeRole === "client") {
      fetchTodayAssignment();
    }
  }, [activeRole, fetchTodayAssignment]);

  const handleStartAssignedWorkout = (assignment) => {
    const w = assignment.Workout;

    if (!w) return;

    const workoutForActive = {
      id: w.workout_id,
      assignmentId: assignment.assigned_workout_id,
      name: w.title,
      estimated_minutes: w.estimated_minutes,
      exercises: (w.Exercises || []).map((ex) => ({
        exercise_id: ex.exercise_id,
        name: ex.name,
        sets: ex.workout_exercise?.sets,
        reps: ex.workout_exercise?.reps,
        breakTime: ex.workout_exercise?.rest_seconds || 10,
      })),
    };

    if (workoutForActive.exercises.length === 0) {
      alert("This workout has no exercises yet. Ask your coach to add some.");
      return;
    }

    setActiveWorkout(workoutForActive);
    navigate("/workouts/active");
  };
  const handleCancelRequest = async () => {
    if (!window.confirm("Cancel your request to this coach?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/coaches/request", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Active-Role": activeRole,
        },
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

  const [wellness, setWellness] = useState({
    sleepHours: 0,
    waterCurrent: 0,
    waterGoal: 0,
    stepLog: 0,
  });

  const [editingCard, setEditingCard] = useState(null);

  const [wellnessInputs, setWellnessInputs] = useState({
    sleepHours: "",
    waterCurrent: "",
    waterGoal: "",
    stepLog: "",
  });

  const [weightInput, setWeightInput] = useState("");
  const [weightData, setWeightData] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [mealChartData, setMealChartData] = useState([]);
  const [workoutChartData, setWorkoutChartData] = useState([]);
  const [selectedMacroDate, setSelectedMacroDate] = useState(new Date());
  const [dailySurveyChartData, setDailySurveyChartData] = useState([]);

  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [selectedTimeView, setSelectedTimeView] = useState("daily");

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

  const fetchCoachData = useCallback(async () => {
    setCoachDataLoading(true);
    const token = localStorage.getItem("token");
    try {
      const [requestsRes, clientsRes] = await Promise.all([
        fetch("http://localhost:4000/api/coach/requests", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }),
        fetch("http://localhost:4000/api/coach/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }),
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setPendingRequests(data.data || []);
      }

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
  }, [activeRole]);

  useEffect(() => {
    if (activeRole === "coach") {
      fetchCoachData();
    }
  }, [activeRole, fetchCoachData]);

  const handleApproveRequest = async (clientUserId, clientName) => {
    if (!window.confirm(`Approve ${clientName} as a client?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/requests/${clientUserId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
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
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }
      );
      if (!res.ok && res.status !== 204) throw new Error("Failed to reject");

      fetchCoachData();
    } catch (err) {
      console.error(err);
      alert("Could not reject request. Try again.");
    }
  };

  const handleDropClient = async (clientUserId, clientName) => {
    if (
      !window.confirm(
        `Drop ${clientName} as a client? This will end the relationship and cancel payment.`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:4000/api/coach/clients/${clientUserId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Active-Role": activeRole,
          },
        }
      );

      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to drop client");
      }

      const existingNotifications = JSON.parse(localStorage.getItem(`clientNotifications-${clientUserId}`)) || []; 

      const newNotification = {
        message: `${user?.first_name} ended the coaching relationship. Payment will be canceled.`,
        date: new Date().toLocaleString(),
        read: false,
      };

      localStorage.setItem(`clientNotifications-${clientUserId}`, 
        JSON.stringify([newNotification, ...existingNotifications])
      );

      fetchCoachData();
    } catch (err) {
      console.error(err);
      alert("Could not drop client. Try again.");
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

  const handleUnhireCoach = async () => {
    if (
      !window.confirm(
        "Are you sure you want to unhire your coach? This will end your coaching relationship."
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/api/client/my-coach", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Active-Role": activeRole,
        },
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to unhire");

      setMyCoach({ state: "none", coach: null });
    } catch (err) {
      console.error(err);
      alert("Could not unhire coach. Try again.");
    }
  };

  //WEIGHT DATA CHANGE TO BACKEND
  useEffect(() => {
    const savedWeightData =
      JSON.parse(localStorage.getItem("weightData")) || [];
    setWeightData(savedWeightData);
  }, []);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");

    const fetchMealsForDay = async () => {
      try {
        const date = selectedMacroDate.toISOString().split("T")[0];

        const res = await fetch(
          `http://localhost:4000/api/logs/meal-log?date=${date}`,
          {
            headers: {
            Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch meals");

        const meals = await res.json();

        const totals = meals.reduce(
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
      } catch (err) {
        console.error("Meal fetch error:", err);
      }
    };
    fetchMealsForDay();
  }, [selectedMacroDate, user]);

  // CLIENT SURVEY CHANGE TO BACKEND?
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
    if (!user) return;

    const fetchTodayActivity = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          "http://localhost:4000/api/logs/workouts/today",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch activity");

        const data = await res.json();
        setActivityCurrent(Number(data.totalMinutes) || 0);
      } catch (err) {
        console.error("Activity fetch error:", err);
      }
    };

    fetchTodayActivity();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchWellness = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:4000/api/logs/wellness-check/today", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setWellness({
            sleepHours: 0,
            waterCurrent: 0, 
            waterGoal: 80,
            stepLog: 0,
          })
        };

        const result = await res.json();
        const logs = result.checkin || {};
        console.log(logs);

        setWellness({
          sleepHours: logs.sleep_hours || 0,
          waterCurrent: Number(logs.water_intake_oz) || 0,
          waterGoal: 80,
          stepLog: logs.steps || 0,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchWellness();
  }, [user]);

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
      const dayKey = new Date(entry.label).toISOString().split("T")[0];

      groupedByDay[dayKey] = {
        day: dayKey,
        value: Number(entry.value),
      };
    });

    return Object.values(groupedByDay);
  }, [weightData]);

  const stepChartData = stepData;
  
  const calorieChartData = mealChartData;

  const volumeChartData = workoutChartData;

  const metricConfigs = {
    weight: {
      title: "Weight (lbs)",
      data: chartData,
      dataKey: "value",
      xKey: "day",
    },
    steps: {
      title: "Step Count",
      data: stepChartData,
      dataKey: "value",
      xKey: "day",
    },
    calories: {
      title: "Calories",
      data: calorieChartData,
      dataKey: "value",
      xKey: "day",
    },
    volume: {
      title: "Workout Volume",
      data: volumeChartData,
      dataKey: "value",
      xKey: "day",
    },
    dailyEnergy: {
      title: "Daily Energy",
      data: dailySurveyChartData,
      dataKey: "energy",
      xKey: "day",
    },
    dailyStress: {
      title: "Daily Stress",
      data: dailySurveyChartData,
      dataKey: "stress",
      xKey: "day",
    },
    dailyMotivation: {
      title: "Daily Motivation",
      data: dailySurveyChartData,
      dataKey: "motivation",
      xKey: "day",
    },
  };

  const currentGraph = metricConfigs[selectedMetric];

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

  const saveWellnessField = async (field) => {
    const value = Number(wellnessInputs[field]) || 0;

    setWellness((prev) => ({
      ...prev,
      [field]: value,
    }));

    const token = localStorage.getItem("token");

    const fieldMap = {
      sleepHours: "sleep_hours",
      waterCurrent: "water_intake_oz",
      stepLog: "steps",
    };

    try {
      await fetch("http://localhost:4000/api/logs/wellness/upsert-today", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [fieldMap[field]]: value,
        }),
      });
    } catch (err) {
      console.error("Failed to save wellness:", err);
    }

    setEditingCard(null);
  };

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");

    const fetchGraphData = async () => {
      try {
        const start = "2026-04-25";
        const end = new Date().toISOString().split("T")[0];

        const [stepsRes, mealsRes, workoutsRes] = await Promise.all([
          fetch(`http://localhost:4000/api/logs/graph?metric=steps&period=day&start=${start}&end=${end}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:4000/api/logs/graph?metric=calories&period=day&start=${start}&end=${end}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:4000/api/logs/graph?metric=volume&period=day&start=${start}&end=${end}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const stepsJson = await stepsRes.json();
        const mealsJson = await mealsRes.json();
        const workoutsJson = await workoutsRes.json();

        const stepsData = stepsJson.data || stepsJson;
        const mealsData = mealsJson.data || mealsJson;
        const workoutsData = workoutsJson.data || workoutsJson;


        // normalize shape for charts
        const format = (arr) =>
          arr.map((item) => ({
            day: item.period,
            value: Number(item.value) || 0,
          }));

        setStepData(format(stepsData));
        setMealChartData(format(mealsData));
        setWorkoutChartData(format(workoutsData));


      } catch (err) {
        console.error("Graph fetch error:", err);
      }
    };

    fetchGraphData();
  }, [user]);

  const deleteTodayMetric = async (field) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://localhost:4000/api/logs/wellness/clear",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ field }),
        }
      );

      if (!res.ok) throw new Error("Failed to delete");

      const updated = await res.json();

      setWellness((prev) => ({
        ...prev,
        sleepHours: updated.sleep_hours || 0,
        waterCurrent: updated.water_intake_oz || 0,
        stepLog: updated.steps || 0,
      }));

    } catch (err) {
      console.error(err);
    }
  };

  const changeMacroDay = (amount) => {
    setSelectedMacroDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + amount);
      return newDate;
    });
  };

  const selectedMacroDateText =
    selectedMacroDate.toLocaleDateString() === new Date().toLocaleDateString()
      ? "Today"
      : selectedMacroDate.toLocaleDateString();

  useEffect(() => {
    const checkToday = async () => {
      const token = localStorage.getItem("token");
      if (!user || !activeRole !== "client") return;

      try {
        const res = await fetch("http://localhost:4000/api/logs/checkins/daily", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          navigate("/daily-checkin");
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkToday();
  }, [user, activeRole, navigate]);

  useEffect(() => {
    if (!user || activeRole !== "client") return;

    const today = new Date();
    const isSunday = today.getDay() === 0;

    const thisWeek = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    const lastWeeklyCheckin = localStorage.getItem(
      `lastWeeklyCheckin-${user.user_id}`
    );

    if (isSunday && lastWeeklyCheckin !== thisWeek) {
      navigate("/weekly-checkin");
    }
  }, [navigate, user, activeRole]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token ) return;
    
    const fetchChartData = async () => {
      try {
        const start = "2026-04-25";
        const end = new Date().toISOString().split("T")[0];

        const [energyRes, stressRes, motivationRes] = await Promise.all([
          fetch(`http://localhost:4000/api/logs/graph?metric=energy&period=day&start=${start}&end=${end}`, {
            headers: { Authorization: `Bearer ${token}`},
          }),
          fetch(`http://localhost:4000/api/logs/graph?metric=stress&period=day&start=${start}&end=${end}`, {
            headers: { Authorization: `Bearer ${token}`},
          }),
          fetch(`http://localhost:4000/api/logs/graph?metric=motivation&period=day&start=${start}&end=${end}`, {
            headers: { Authorization: `Bearer ${token}`},
          }),
        ]);

        const energyData = await energyRes.json();
        const stressData = await stressRes.json();
        const motivationData = await motivationRes.json();

        const merged = energyData.map((item, index) => ({
          day: item.period,
          energy: Number(item.value) || 0,
          stress: Number(stressData[index]?.value) || 0,
          motivation: Number(motivationData[index]?.value || 0),
        }));

        setDailySurveyChartData(merged);
      } catch (err) {
        console.error("Chart fetch error:", err);
      }
    };

    fetchChartData();
  }, [user]);

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
          onDropClient={handleDropClient}
          getTimeAgo={getTimeAgo}
        />
      ) : (
        <div className="dashboard-layout">
          <div className="dashboard-left">
            <div className="welcome">Welcome back, {user?.first_name}!</div>

            {activeRole === "client" && (
              <section className="dashboard-section">
                <div className="section-title">My Coach</div>

                <div className="my-coach-card">
                  {myCoach.state === "loading" && (
                    <div className="my-coach-loading">Loading...</div>
                  )}

                  {myCoach.state === "none" && (
                    <div className="my-coach-empty">
                      <div className="my-coach-empty-icon">🏋️</div>
                      <div className="my-coach-empty-text">
                        <h4>You don't have a coach yet.</h4>
                        <p>
                          Browse our coaches and find the right fit for your
                          goals.
                        </p>
                      </div>
                      <Link to="/coach" className="my-coach-cta">
                        Browse Coaches →
                      </Link>
                    </div>
                  )}

                  {(myCoach.state === "pending" ||
                    myCoach.state === "active") &&
                    myCoach.coach && (
                      <div className="my-coach-active">
                        <img
                          src={
                            myCoach.coach.profile_pic || "/default-avatar.png"
                          }
                          alt={myCoach.coach.first_name}
                          className="my-coach-avatar"
                        />

                        <div className="my-coach-info">
                          <div className="my-coach-name-row">
                            <h4 className="my-coach-name">
                              {myCoach.coach.first_name}{" "}
                              {myCoach.coach.last_name}
                            </h4>
                            <span
                              className={`my-coach-status-pill ${myCoach.state}`}
                            >
                              {myCoach.state === "pending"
                                ? "Pending"
                                : "Active"}
                            </span>
                          </div>
                          <p className="my-coach-specialty">
                            {myCoach.coach.specialization || "General Coaching"}
                          </p>
                          {myCoach.state === "active" && (
                            <p className="my-coach-hint">
                              You're working with this coach.
                            </p>
                          )}
                          {myCoach.state === "pending" && (
                            <p className="my-coach-hint">
                              Waiting for coach to approve your request.
                            </p>
                          )}
                        </div>

                        <div className="my-coach-actions">
                          <Link
                            to={`/coach/${myCoach.coach.user_id}`}
                            className="my-coach-btn-secondary"
                          >
                            View Profile
                          </Link>
                          {myCoach.state === "pending" && (
                            <button
                              onClick={handleCancelRequest}
                              className="my-coach-btn-danger"
                            >
                              Cancel Request
                            </button>
                          )}
                          {myCoach.state === "active" && (
                            <button
                              onClick={handleUnhireCoach}
                              className="my-coach-btn-danger"
                            >
                              Unhire
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </section>
            )}

            {activeRole === "client" && (
              <section className="dashboard-section">
                <div className="section-title">My Subscription</div>
                <div className="my-coach-card">
                  {subLoading && (
                    <div className="my-coach-loading">Loading...</div>
                  )}

                  {!subLoading && !subscription && (
                    <div className="my-coach-empty">
                      <div className="my-coach-empty-icon">💳</div>
                      <div className="my-coach-empty-text">
                        <h4>No active subscription.</h4>
                        <p>Browse a coach's profile and subscribe to a plan.</p>
                      </div>
                      <Link to="/coach" className="my-coach-cta">
                        Browse Coaches →
                      </Link>
                    </div>
                  )}

                  {!subLoading &&
                    subscription &&
                    (() => {
                      const end = new Date(subscription.end_date);
                      const today = new Date();
                      const daysLeft = Math.max(
                        0,
                        Math.ceil((end - today) / 86400000)
                      );
                      return (
                        <div className="my-coach-active">
                          <div className="my-coach-info">
                            <div className="my-coach-name-row">
                              <h4 className="my-coach-name">
                                {subscription.coach?.first_name}{" "}
                                {subscription.coach?.last_name}
                              </h4>
                              <span
                                className={`my-coach-status-pill ${subscription.status}`}
                              >
                                {subscription.status.charAt(0).toUpperCase() +
                                  subscription.status.slice(1)}
                              </span>
                            </div>
                            <p className="my-coach-specialty">
                              {subscription.coachingPlan?.title}
                            </p>
                            <p className="my-coach-hint">
                              {subscription.status === "cancelled"
                                ? `Access until ${new Date(
                                    subscription.end_date
                                  ).toLocaleDateString()}`
                                : `${daysLeft} day${
                                    daysLeft !== 1 ? "s" : ""
                                  } remaining`}
                            </p>
                          </div>
                          <div className="my-coach-actions">
                            <Link
                              to={`/coach/${subscription.coach_id}`}
                              className="my-coach-btn-secondary"
                            >
                              View Coach
                            </Link>
                            {subscription.status === "active" && (
                              <button
                                onClick={handleCancelSubscription}
                                className="my-coach-btn-danger"
                              >
                                Cancel Plan
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                </div>
              </section>
            )}

            <section className="dashboard-section">
              <div className="section-title">This Week's Workouts</div>
              <div className="dashboard-card week-grid-card">
                {(() => {
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  const days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(startOfWeek);
                    d.setDate(startOfWeek.getDate() + i);
                    return d;
                  });
                  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  return (
                    <div className="week-day-row">
                      {days.map((d, i) => {
                        const key = d.toISOString().split("T")[0];
                        const isToday = d.toDateString() === today.toDateString();
                        const isPast = d < new Date(today.toDateString());
                        const workouts = weekWorkouts.filter((a) => a.due_date === key);
                        const personal = weekPersonalEvents.filter((e) => e.date === key);
                        return (
                          <div key={i} className={`week-day-cell ${isToday ? "week-day-today" : ""} ${isPast && !isToday ? "week-day-past" : ""}`}>
                            <span className="week-day-label">{DAYS[i]}</span>
                            <span className={`week-day-num ${isToday ? "week-day-num-today" : ""}`}>{d.getDate()}</span>
                            <div className="week-day-workouts">
                              {workouts.length === 0 && personal.length === 0 ? (
                                <span className="week-day-empty">—</span>
                              ) : (
                                <>
                                  {workouts.map((a) => (
                                    <span key={a.assigned_workout_id} className={`week-day-pill ${a.status === "completed" ? "pill-done" : "pill-scheduled"}`}>
                                      {a.Workout?.title || "Workout"}
                                    </span>
                                  ))}
                                  {personal.map((e) => (
                                    <span key={e.calendar_event_id} className="week-day-pill" style={{ background: e.color, color: "white" }}>
                                      {e.text}
                                    </span>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-title">Today's Workout</div>
              <div className="dashboard-card workout-card">
                {todayLoading ? (
                  <div className="workout-empty">Loading...</div>
                ) : todayAssignment ? (
                  <>
                    <div className="workout-image"></div>
                    <div className="workout-info">
                      <div className="workout-header-row">
                        <div>
                          <div className="workout-title">
                            {todayAssignment.Workout?.title || "Workout"}
                          </div>
                          {todayAssignment.coach && (
                            <div className="workout-coach">
                              From {todayAssignment.coach.first_name}{" "}
                              {todayAssignment.coach.last_name}
                            </div>
                          )}
                        </div>
                        <span className="workout-level">Today</span>
                      </div>

                      <div className="workout-meta">
                        {todayAssignment.Workout?.estimated_minutes && (
                          <span>
                            {todayAssignment.Workout.estimated_minutes} min
                          </span>
                        )}
                        {todayAssignment.Workout?.description && (
                          <span>{todayAssignment.Workout.description}</span>
                        )}
                      </div>

                      {todayAssignment.coach_notes && (
                        <div className="workout-coach-notes">
                          "{todayAssignment.coach_notes}"
                        </div>
                      )}

                      <div className="workout-footer">
                        {todayAssignment.status === "completed" ? (
                          <div className="workout-completed-pill">
                            ✓ Completed
                            {todayAssignment.completed_at &&
                              ` at ${new Date(
                                todayAssignment.completed_at
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`}
                          </div>
                        ) : (
                          <button
                            className="start-workout-btn"
                            onClick={() =>
                              handleStartAssignedWorkout(todayAssignment)
                            }
                          >
                            Start Workout
                          </button>
                        )}
                        <Link to="/calendar" className="streak-text">
                          View calendar →
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="workout-empty-state">
                    <div className="workout-empty-icon">📭</div>
                    <h4>No workout assigned for today</h4>
                    <p>Check your calendar for upcoming workouts.</p>
                    <Link to="/calendar" className="start-workout-btn">
                      View Calendar
                    </Link>
                  </div>
                )}
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
                    <svg viewBox="0 0 24 24" className="health-svg">
                      <path
                        d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                  <button
                    type="button"
                    className="delete-metric-btn"
                    onClick={() => deleteTodayMetric("sleepHours")}
                  >
                    Delete Today
                  </button>
                </div>

                <div className="health-card">
                  <h4 className="health-title">Water</h4>
                  <div className="health-icon">
                    <svg viewBox="0 0 24 24" className="health-svg">
                      <path
                        d="M12 2C12 2 6 9 6 13a6 6 0 0 0 12 0c0-4-6-11-6-11z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                  <button
                    type="button"
                    className="delete-metric-btn"
                    onClick={() => deleteTodayMetric("waterCurrent")}
                  >
                    Delete Today
                  </button>
                </div>

                <div className="health-card">
                  <h4 className="health-title">Heart</h4>
                  <div className="health-icon">
                    <svg viewBox="0 0 24 24" className="health-svg">
                      <path
                        d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0L12 7.9 8.7 4.6c-1.5-1.5-4-1.5-5.5 0 -1.5 1.5-1.5 4 0 5.5L12 19l8.8-8.9c1.5-1.5 1.5-4 0-5.5z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {editingCard === "heartLog" ? (
                    <input
                      type="number"
                      name="heartLog"
                      value={wellnessInputs.heartLog}
                      onChange={handleWellnessInputChange}
                      onBlur={() => saveWellnessField("heartLog")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveWellnessField("heartLog");
                        }
                      }}
                      className="wellness-inline-input"
                      autoFocus
                    />
                  ) : (
                    <p
                      className="health-value clickable-value"
                      onClick={() => startEditing("heartLog")}
                    >
                      {wellness.heartLog} <span>bpm</span>
                    </p>
                  )}
                  <button
                    type="button"
                    className="delete-metric-btn"
                    onClick={() => deleteTodayMetric("heartLog")}
                  >
                    Delete Today
                  </button>
                </div>

                <div className="health-card">
                  <h4 className="health-title">Steps</h4>
                  <div className="health-icon">
                    <svg viewBox="0 0 24 24" className="health-svg">
                      <path
                        d="M5 19V11"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10 19V7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M15 19V13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M20 19V9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {editingCard === "stepLog" ? (
                    <input
                      type="number"
                      name="stepLog"
                      value={wellnessInputs.stepLog}
                      onChange={handleWellnessInputChange}
                      onBlur={() => saveWellnessField("stepLog")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveWellnessField("stepLog");
                        }
                      }}
                      className="wellness-inline-input"
                      autoFocus
                    />
                  ) : (
                    <p
                      className="health-value clickable-value"
                      onClick={() => startEditing("stepLog")}
                    >
                      {wellness.stepLog} <span>steps</span>
                    </p>
                  )}
                  <button
                    type="button"
                    className="delete-metric-btn"
                    onClick={() => deleteTodayMetric("stepLog")}
                  >
                    Delete Today
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="dashboard-right">
            <div className="analytics-row">
              <div className="widget-card macros-card">
                <div className="widget-header">
                  <h4>Macros</h4>

                  <div className="macro-date-controls">
                    <button type="button" onClick={() => changeMacroDay(-1)}>
                      &lt;
                    </button>
                    <span>{selectedMacroDateText}</span>
                    <button type="button" onClick={() => changeMacroDay(1)}>
                      &gt;
                    </button>
                  </div>
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
                  <h4>{currentGraph.title}</h4>
                  <span>{selectedTimeView}</span>
                </div>

                <div className="graph-tabs">
                  <button
                    type="button"
                    className={selectedMetric === "weight" ? "active" : ""}
                    onClick={() => setSelectedMetric("weight")}
                  >
                    Weight
                  </button>
                  <button
                    type="button"
                    className={selectedMetric === "steps" ? "active" : ""}
                    onClick={() => setSelectedMetric("steps")}
                  >
                    Steps
                  </button>
                  <button
                    type="button"
                    className={selectedMetric === "volume" ? "active" : ""}
                    onClick={() => setSelectedMetric("volume")}
                  >
                    Workouts
                  </button>

                  <button
                    type="button"
                    className={selectedMetric === "dailyEnergy" ? "active" : ""}
                    onClick={() => setSelectedMetric("dailyEnergy")}
                  >
                    Energy
                  </button>

                  <button
                    type="button"
                    className={selectedMetric === "dailyStress" ? "active" : ""}
                    onClick={() => setSelectedMetric("dailyStress")}
                  >
                    Stress
                  </button>

                  <button
                    type="button"
                    className={
                      selectedMetric === "dailyMotivation" ? "active" : ""
                    }
                    onClick={() => setSelectedMetric("dailyMotivation")}
                  >
                    Motivation
                  </button>
                </div>

                <div className="time-tabs">
                  <button
                    type="button"
                    className={selectedTimeView === "daily" ? "active" : ""}
                    onClick={() => setSelectedTimeView("daily")}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    className={selectedTimeView === "weekly" ? "active" : ""}
                    onClick={() => setSelectedTimeView("weekly")}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    className={selectedTimeView === "monthly" ? "active" : ""}
                    onClick={() => setSelectedTimeView("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className={selectedTimeView === "yearly" ? "active" : ""}
                    onClick={() => setSelectedTimeView("yearly")}
                  >
                    Yearly
                  </button>
                </div>

                {selectedMetric === "weight" && (
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
                )}

                <div className="weight-chart-recharts">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={currentGraph.data}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.12)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey={currentGraph.xKey}
                        tick={{ fill: "#cfd6de", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{ fill: "#cfd6de", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />

                      <Line
                        type="monotone"
                        dataKey={currentGraph.dataKey}
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
