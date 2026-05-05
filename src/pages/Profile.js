import React, { useState, useEffect, useContext, useRef } from "react";
import "../styles/Profile.css";
import userimg from "../images/user.svg";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const {activeRole} = useContext(AuthContext);
  const[showNewForm, setShowNewForm] = useState(false);
  const[qualifications, setQualifications] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const[modalAvail, setModalAvail] = useState(false);
  const[type, setType] = useState("qualification");
  const[file, setFile]=useState(null);
  const[qualForm, setQualForm] = useState({
    degree_name:"",
    institution: "",
    field_of_study: "",
    year_completed: "",
  });
  const [timeRules, setTimeRules] = useState([]);
  const [startTime, setStartTime]=useState("09:00");
  const [endTime, setEndTime]=useState("22:00");
  const daysofWeek = ["S", "M", "T", "W", "TH", "F", "S"];
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells = [...blanks, ...days];
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
  const [duration, setDuration] = useState(60);
  const dayMap = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};
  const fileRef = useRef(null);

  const [activeDays, setActiveDays] = useState(new Set([1, 2, 3, 4, 5]));
 
  const toggleDay = (i) => {
    setActiveDays((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const [qRes, cRes] = await Promise.all([
      fetch("http://localhost:4000/api/qualifications", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:4000/api/certifications", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const qData = await qRes.json();
    const cData = await cRes.json();

    setQualifications(Array.isArray(qData) ? qData : []);
    setCertifications(Array.isArray(cData) ? cData : []);
  };
 
  useEffect(() => {
  if (!modalOpen) return;

  fetchData();
}, [modalOpen]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user, setUser, logout } = useContext(AuthContext); //add activeRole
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
      if (!token) return; //delete

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
    navigate("/home");
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; //delete
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

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (type === "certification"){
      if (!file) return alert("Upload a file.");

      const formData = new FormData();
      formData.append("document", file);

      const res = await fetch("http://localhost:4000/api/certifications", {
        method: "POST",
        headers: {Authorization: `Bearer ${token}`},
        body: formData,
      });
      setFile(null);
      const data=await res.json;
      console.log(data);
    }
    if (type === "qualification") {
      const res = await fetch("http://localhost:4000/api/qualifications", {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify(qualForm),
      });
      const data = await res.json();
      console.log(data);
    }
  setShowNewForm(false);
  await fetchData();
};

const generateTimes = (interval = 30) => {
  const times = [];

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hour24 = h;
      const minute = String(m).padStart(2, "0");

      const period = hour24 >= 12 ? "PM" : "AM";
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

      times.push({
        label: `${hour12}:${minute} ${period}`,
        value: `${String(hour24).padStart(2, "0")}:${minute}`,
      });
    }
    }

  return times;
};

  const timeOptions = generateTimes(30);

  const addRule = () => {
    const startIndex = timeOptions.findIndex(t => t.value === startTime);
    const endIndex = startIndex + duration / 30;

    const end = timeOptions[endIndex]?.value;

    if (!end) {
      alert("Invalid duration");
    return;
  }

  const newRule = Array.from(activeDays).map((day) => ({
    id: crypto.randomUUID(),
    dayOfWeek: Number(day),
    startTime,
    endTime: end,
    duration,
  }));

  setTimeRules((prev) => [...prev, ...newRule]);
};

const formatTime = (time24) => {
  if (!time24) return "";

  const [hourStr, minute] = time24.split(":");
  let hour = Number(hourStr);

  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
};

const hasAvailability = (day) => {
  const date = new Date(currentYear, currentMonth, day);
  const dayOfWeek = date.getDay();
  return timeRules.some((rule) => Number(rule.dayOfWeek) === dayOfWeek);
};

    useEffect(() => {
      if (modalAvail) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }

      return () => {
        document.body.style.overflow = "auto";
      };
  }, [modalAvail]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDeleteRule = (id) => {
  setTimeRules((prev) => prev.filter((rule) => rule.id !== id));
};

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      const res = await fetch("http://localhost:4000/api/profile/picture", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      setUser((prev) => ({ ...prev, profile_pic: data.profile_pic }));
      setMessage("Profile picture updated!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(data.error || "Failed to upload picture");
    }
  } catch (err) {
    setMessage("Something went wrong.");
  }
};

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  if (!user) return <p>Loading ...</p>;

  return (
    <div className="profile-page">
      <div className="container-left">
        <div className="profile-text">Profile Settings</div>
        {user?.profile_pic ? (
          <img src={user.profile_pic.startsWith("http") ? user.profile_pic: 
            `http://localhost:4000${user.profile_pic}`
          }
          alt="Profile"
          className="avatar"
          />
        ) : (
        <img src={userimg} alt="" className="avatar" />
        )}
        <div className="profile-name">
          {user?.first_name || "First"} {user?.last_name || "Last"}
        </div>
        {activeRole === "coach" && <div className="profile-badge">Coach</div>}
        <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        ref={fileRef}
        style={{display: "none"}}
        onChange={handlePictureUpload}
        />
        <button className="upload-btn" onClick={() => fileRef.current.click()}>
          Upload new image
          </button>
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
          <input id="email" type="text" defaultValue={user?.email || ""} disabled />
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

            <div className="profile-btn-footer">
            <button className="save-btn" onClick={() => setModalAvail(true)}>
              Manage Coaching Availability
            </button>

            <button className="save-btn" onClick={() => setModalOpen(true)}>
              Update Qualifications
            </button>
            </div>

              {/*modal for coaching availability*/}
              {modalAvail &&(
              <div className="modal-container">
                <div className="modal-availability">
                  <div className="modal-header">
                    <h2>Update Your Coaching Availability</h2>
                  </div>
                  <div className="avail-content">
                  <div className="modal-left avail-left-container">
                  <div className="date-container">
                    <div className="date-box">
                      <label>Start Time</label>
                      <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                        {timeOptions.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                          </select>
                          </div>
                          
                          <div className="date-box">
                          <label>End Time</label>
                          <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                            {timeOptions
                            .filter((t) => t.value > startTime) // prevents invalid times
                            .map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                            </select>
                            </div>
                            </div>
                              <div className="weekday-row">
                                <label>Select Available Days</label>
                                <div className="day-btn">
                                {daysofWeek.map((d, i) => (
                                  <button
                                    key={i}
                                    className={activeDays.has(i) ? "day active" : "day"}
                                    onClick={() => toggleDay(i)}>
                                      {d}</button>
                                    ))}
                                    </div>
                                    </div>
                                    <div className="duration-box">
                                      <label>Set Session Duration:</label>
                                        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                                          <option value={30}>30 minutes</option>
                                          <option value={60}>60 minutes</option>
                                          <option value={90}>90 minutes</option>
                                          <option value={120}>120 minutes</option>
                                          </select>
                                    </div>
                            <button className="save-btn avail-btn" onClick={addRule}>Add Availability</button>
                            <div className="rules-list">
                              {timeRules.length === 0 ? (
                                <p>No availability added yet</p>
                              ):(
                              timeRules.map((r) => (
                                <div key={r.id} className="rule-item">
                                  <div className="rule-header">
                                  <h3>{dayMap[r.dayOfWeek]}: {formatTime(r.startTime)} to {formatTime(r.endTime)}</h3>
                                  <button className="rule-item-btn" onClick={() => handleDeleteRule(r.id)}>
                                    Delete
                                    </button>
                                  </div>
                                  <h4>Session Duration: {r.duration} minutes</h4>
                                </div>
                              )
                                ))}
                                </div>
                                </div>

                                <div className="modal-right">
                                  <div className="calendar-panel">
                                    <div className="calendar-header">
                                      <button onClick={prevMonth}>‹</button>
                                      <h3>{months[currentMonth]} {currentYear}</h3>
                                      <button onClick={nextMonth}>›</button>
                                      </div>
                                      <div className="calendar-weekdays">
                                        {weekdays.map(d => (
                                          <div key={d}>{d}</div>
                                          ))}
                                          </div>
                                          <div className="calendar-grid">
                                            {cells.map((day, i) => (
                                              <div
                                              key={i}
                                              className={`calendar-cell 
                                              ${!day ? "empty" : ""} 
                                              ${isToday(day) ? "today" : ""}
                                              ${day && hasAvailability(day) ? "available" : ""}`}>
                                                {day}
                                                </div>
                                              ))}
                                              </div>
                                              </div>
                                              <div className="avail-btn-footer">
                                              <button className="avail-delete-btn" onClick={() => setModalAvail(false)}>
                                                Close
                                              </button>
                                              </div>
                                </div>
                  </div>
                  </div>
                  </div>   
            )}


              {modalOpen && (
            <div className="modal-container">
              {/* modal pops up when coach tries to update qualifications/certification */}
              <div className="modal"> 
                <div className="modal-header">
                  <h2>Update Qualifications and Certification</h2>
                </div>
                <div className="toggle">
                  <button className="toggle-btns" onClick={() => {setType("qualification"); setShowNewForm(false);}}>
                    Qualification
                  </button>
                  <button className="toggle-btns" onClick={() => {setType("certification"); setShowNewForm(false);}}>
                    Certification
                  </button>
                  </div>
                <div className="modal-content">
                  {/*qualification form option*/}
                  {!showNewForm && type ==="qualification" && (
                    <>
                    <h3>Existing Qualifications</h3>
                    {qualifications.length === 0 ? (
                      <p>You have no existing qualifications.</p>
                    ) : (
                      qualifications.map((q) => (
                        <div key={q.qualification_id} className="avail-card">
                          <label>Degree Name</label>
                          <p>{q.degree_name}</p>
                          <label>Institution</label>
                          <p>{q.institution}</p>
                          <label>Year Completed</label>
                          <p>{q.year_completed}</p>
                        </div>
                      ))
                    )}
                  <div className="modal-footer">
                  <button className="modal-btns" onClick={() => setShowNewForm(true)}>
                    + Add New
                  </button>
                  <button className="modal-btns" type="button" onClick={() => setModalOpen(false)}>
                    Close
                    </button>
                </div>
                    </>
                  )}
                  {type ==="qualification" && showNewForm && (
                    <>
                    <div className="input-group2">
                    <label>Degree Name</label>
                    <input type="text" placeholder="e.g Bachelor of Science"
                    onChange={(e) => setQualForm({...qualForm, degree_name: e.target.value})
                    }
                    />
                    <label>Institution</label>
                    <input type="text" placeholder="e.g New Jersey Institute of Technology"
                    onChange={(e) => setQualForm({...qualForm, institution: e.target.value})
                  }
                  />
                  <label>Field of Study</label>
                  <input type="text" placeholder="e.g Medicine"
                  onChange={(e) => setQualForm({...qualForm, field_of_study: e.target.value})
                }
                  />
                  <label>Year Completed</label>
                  <input type="text" placeholder="e.g 2026"
                  onChange={(e) => setQualForm({...qualForm, year_completed: e.target.value})}
                  />
                  </div>
                  <div className="modal-footer">
                  <button className="modal-btns" onClick={handleSubmit}>Submit</button>
  
                  <button className="modal-btns" onClick={() => setShowNewForm(false)}>
                    Back
                    </button>
                    </div>
                    </>
                    )}
                    {/*certification form option*/}
                    {!showNewForm && type ==="certification" && (
                      <>
                      <h3>Exisiting Certifications</h3>
                      {certifications.length === 0 ? (
                        <p>You have no existing certifications</p>
                      ) : (
                        certifications.map((c) => (
                          <div key={c.certification_id} className="avail-card">
                            <a href={c.document_url} target="_blank" rel="noopener noreferrer">
                              📄 {c.document_url.split("/").pop()}
                            </a>
                            <span className={`cert-status ${c.status}`}>{c.status}</span>
                          </div>
                        ))
                      )}
                  <div className="modal-footer">
                  <button className="modal-btns" onClick={() => setShowNewForm(true)}>
                    + Add New
                  </button>
                  <button className="modal-btns" type="button" onClick={() => setModalOpen(false)}>
                    Close
                    </button>
                </div>
                      </>
                    )}
                    {type === "certification" && showNewForm && (
                      <div className="upload-zone">
                      <div className="upload-zone-icon">↑</div>
                      <p className="upload-zone-title">
                        Drag and drop files here or upload
                      </p>
                      <p className="upload-zone-sub">
                        Accepted file types: PDF, PNG, JPG, JPEG
                      </p>
                      <label className="upload-zone-btn">
                        Upload
                      <input
                        type="file"
                        multiple
                        accept=".pdf, .png, .jpg, .jpeg"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          setFile(Array.from(e.target.files))
                        }
                      />
                      </label>
                      {file && <p className="upload-zone-filename">📄 {file.name}</p>}
                      <div className="modal-footer">
                      <button className="modal-btns" onClick={handleSubmit}>Submit</button>
                      <button className="modal-btns" onClick={() => setShowNewForm(false)}>
                        Back
                        </button>
                        </div>
                      </div>
                      
                    )}
                </div>
                
              </div>
            </div>
              )}
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
