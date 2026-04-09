import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Workouts from "./pages/Workouts";
import CustomWorkout from "./pages/CustomWorkout";
import PremadeWorkouts from "./pages/PremadeWorkouts";
import Logs from "./pages/Logs";
import Calendar from "./pages/Calendar";
import Payments from "./pages/Payments";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import SurveyPage from "./pages/SurveyPage";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import RecentMeals from "./pages/RecentMeals";
import RecentWorkouts from "./pages/RecentWorkouts";

import ActiveWorkout from "./pages/ActiveWorkout";

import PaymentHistory from "./pages/PaymentHistory";

function App() {
  const location = useLocation();

  const hideHeader = location.pathname === "/";
  const hideHeader2 = location.pathname === "/signup";
  const hideHeader3 = location.pathname === "/login";

  return (
    <div className="body">
      {!hideHeader && !hideHeader2 && !hideHeader3 && <Header />}

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/auth/callback" element={<GoogleAuthCallback />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workouts/custom" element={<CustomWorkout />} />
          <Route path="/workouts/premade" element={<PremadeWorkouts />} />
          <Route path="/workouts/active" element={<ActiveWorkout />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recent-meals" element={<RecentMeals />} />
          <Route path="/recent-workouts" element={<RecentWorkouts />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
