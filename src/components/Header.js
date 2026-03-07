import React from "react";
import { Link } from "react-router-dom";
import userIcon from "../images/user.svg";
import inboxIcon from "../images/inbox.svg";
import homeIcon from "../images/home.svg"; 

function Header() {
  return (
    <div className="header">

      <div className="logo">logo</div>
        <Link to="/" className="circle">
          <img src={homeIcon} alt="Home icon" className="home-icon" /> 
        </Link>
{/* logo can become home button but we need one still */}

      <div className="nav-pill">
        <Link to="/dashboard" className="nav-btn">Dashboard</Link>
        <Link to="/coach" className="nav-btn">Coach</Link>
        <Link to="/workouts" className="nav-btn">Workouts</Link>
        <Link to="/logs" className="nav-btn">Logs</Link>
        <Link to="/calendar" className="nav-btn">Calendar</Link>
        <Link to="/payments" className="nav-btn">Payments</Link>
      </div>

      <div className="right-btns">

        <div className="icon-btn">
          <Link to="/messages" className="circle">
            <img src={inboxIcon} alt="Messages icon" className="circle-icon" />
          </Link>

          <div className="nav-small">
            <Link to="/messages" className="nav-btn-small">Messages</Link>
          </div>
        </div>

        <div className="icon-btn">
          <Link to="/profile" className="circle">
            <img src={userIcon} alt="Profile icon" className="circle-icon" />
          </Link>

          <div className="nav-small">
            <Link to="/profile" className="nav-btn-small">Profile</Link>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Header;