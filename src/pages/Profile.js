import React, { useState } from "react";
import "../styles/Profile.css";
import userimg from "../images/user.svg";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  // Get the user from auth context
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    goal: user?.goal || "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to update profile");
      }
    } catch (error) {
      setMessage("Something went wrong.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return <p>Loading ...</p>;

  return (
    <div className="profile-page">
      <div className="container-left">
        <div className="profile-text">Profile Settings</div>
        {user.profile_pic ? (
          <img src={user.profile_pic} alt="Profile" className="avatar" />
        ) : (
          <img src={userimg} alt="" className="avatar" />
        )}
        <div className="profile-name">
          {user.first_name} {user.last_name}
        </div>
        <button className="upload-btn">Upload new image</button>
        <button className="signout-btn" onClick={handleLogout}>
          Sign out
        </button>
        <button className="delete-btn">Delete Account</button>
      </div>
      <div className="container-right">
        <h3>BASIC INFORMATION</h3>
        <div className="line"></div>

        {message && <div className="profile-message"> {message}</div>}
        <div className="name">
          <div className="input-group">
            <label htmlFor="firstname">First Name</label>
            <input
              id="firstname"
              name="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="lastname">Last Name</label>
            <input
              id="lastname"
              name="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="input-group email-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="text" defaultValue={user.email} disabled />
        </div>
        <div className="input-group phone-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <h3>UPDATE PERSONAL GOALS</h3>
        <div className="line"></div>
        <div className="input-group goals">
          <label htmlFor="goals">Goals</label>
          <select
            id="goals"
            name="goal"
            value={form.goal || ""}
            onChange={handleChange}
          >
            <option value="">Select Your Goal</option>
            <option value="lose">Lose Weight</option>
            <option value="gain">Gain Weight</option>
            <option value="maintain">Maintain</option>
          </select>
        </div>
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Profile;
