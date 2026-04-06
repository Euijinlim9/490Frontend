import React, { useState, useEffect, useContext } from "react";
import "../styles/Profile.css";
import userimg from "../images/user.svg";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user, setUser, logout, activeRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    goal: user?.goal || "",
  });

  const [coachForm, setCoachForm] = useState({
    bio: "",
    experience_years: "",
    specialization: "",
    price: "",
  });

  const [message, setMessage] = useState("");

  // Fetch coach data when active role is coach
  useEffect(() => {
    const fetchCoachData = async () => {
      if (activeRole !== "coach") return;

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/profile/coach", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCoachForm({
          bio: data.coach.bio || "",
          experience_years: data.coach.experience_years || "",
          specialization: data.coach.specialization || "",
          price: data.coach.price || "",
        });
      }
    };
    fetchCoachData();
  }, [activeRole]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCoachChange = (e) => {
    setCoachForm({ ...coachForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      // Save basic profile
      const res = await fetch("http://localhost:4000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      // Save coach profile if active role is coach
      if (activeRole === "coach") {
        const coachRes = await fetch(
          "http://localhost:4000/api/profile/coach",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(coachForm),
          }
        );
        const coachData = await coachRes.json();
        if (!coachRes.ok) {
          setMessage(coachData.error || "Failed to update coach profile");
          return;
        }
      }

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

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        logout();
        navigate("/");
      } else {
        setMessage(data.message || "Failed to delete account");
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
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
        {activeRole === "coach" && <div className="profile-badge">Coach</div>}
        <button className="upload-btn">Upload new image</button>
        <button className="signout-btn" onClick={handleLogout}>
          Sign out
        </button>
        <button
          className="delete-btn"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete Account
        </button>
        {showDeleteConfirm && (
          <div className="delete-overlay">
            <div className="delete-modal">
              <h3>Delete Account</h3>
              <p>Are you sure? This action cannot be undone.</p>
              <div className="delete-confirm-buttons">
                <button
                  className="delete-confirm-yes"
                  onClick={handleDeleteAccount}
                >
                  Yes, Delete
                </button>
                <button
                  className="delete-confirm-no"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="container-right">
        <h3>BASIC INFORMATION</h3>
        <div className="line"></div>

        {message && <div className="profile-message">{message}</div>}

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

        {/* Coach-specific fields */}
        {activeRole === "coach" && (
          <>
            <h3>COACH PROFILE</h3>
            <div className="line"></div>

            <div className="input-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                placeholder="Tell clients about yourself, your approach, and your experience..."
                value={coachForm.bio}
                onChange={handleCoachChange}
              />
            </div>

            <div className="name">
              <div className="input-group">
                <label htmlFor="experience_years">Years of Experience</label>
                <input
                  id="experience_years"
                  name="experience_years"
                  type="number"
                  placeholder="0"
                  value={coachForm.experience_years}
                  onChange={handleCoachChange}
                />
              </div>
              <div className="input-group">
                <label htmlFor="price">Session Price ($)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="0.00"
                  value={coachForm.price}
                  onChange={handleCoachChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="specialization">Specialization</label>
              <select
                id="specialization"
                name="specialization"
                value={coachForm.specialization}
                onChange={handleCoachChange}
              >
                <option value="">Select Specialization</option>
                <option value="strength-training">Strength Training</option>
                <option value="cardio">Cardio</option>
                <option value="yoga">Yoga</option>
                <option value="nutrition">Nutrition</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="sports-performance">Sports Performance</option>
                <option value="rehabilitation">Rehabilitation</option>
                <option value="general-fitness">General Fitness</option>
              </select>
            </div>
          </>
        )}

        {/* Client goal - show when in client mode */}
        {activeRole !== "coach" && (
          <>
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
          </>
        )}

        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Profile;
