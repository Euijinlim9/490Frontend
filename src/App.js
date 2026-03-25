import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";

import Login from "./pages/login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import Workouts from "./pages/Workouts";
import Logs from "./pages/Logs";
import Calendar from "./pages/Calendar";
import Payments from "./pages/Payments";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

function App() {
  const location = useLocation();

  const hideHeader = location.pathname === "/";

  return (
    <div className="body">
      {!hideHeader && <Header />}

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;