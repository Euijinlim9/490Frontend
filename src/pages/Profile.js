import React, { useState, useEffect, useContext } from "react";
import "../styles/Profile.css";
import userimg from "../images/user.svg";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const[showNewForm, setShowNewForm] = useState(false);
  const[qualifications, setQualifications] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const[type, setType] = useState("qualification");
  const[file, setFile]=useState(null);
  const[qualForm, setQualForm] = useState({
    degree_name:"",
    institution: "",
    field_of_study: "",
    year_completed: "",
  });

 
  useEffect(() => {
  if (!modalOpen) return;

  const token = localStorage.getItem("token");

  const fetchData = async () => {
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

    setQualifications(qData);
    setCertifications(cData);
  };

  fetchData();
}, [modalOpen]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user, setUser, logout, activeRole } = useContext(AuthContext);

const activeRole = "coach"; // or "client"
const setUser = () => {};
const logout = () => {};
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

  const handleSubmit = async () => {
  const formData = new FormData();

  formData.append("type", type);

  if (type === "certification") {
    if (!file) return alert("Upload a file");

    formData.append("document", file);
  }

  if (type === "qualification") {
    formData.append("degree_name", qualForm.degree_name);
    formData.append("institution", qualForm.institution);
    formData.append("field_of_study", qualForm.field_of_study);
    formData.append("year_completed", qualForm.year_completed);
  }

  const res = await fetch("/api/documents", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  console.log(data);
  setModalOpen(false);
};

  //if (!user) return <p>Loading ...</p>;
  if (!user) return <user />;

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

            <button className="save-btn" onClick={() => setModalOpen(true)}>
              Update Qualifications</button>
              {modalOpen && (
            <div className="modal-container">
              {/* modal pops up when coach tries to update qualifications/certification */}
              <div className="modal"> 
                <div className="modal-header">
                  <h2>Update Qualifications and Certification</h2>
                </div>
                <div className="toggle">
                  <button className="toggle-btns" onClick={() => setType("qualification")}>
                    Qualification
                  </button>
                  <button className="toggle-btns" onClick={() => setType("certification")}>
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
                        <div key={q.id} className="item-card">
                          <p>{q.degree_name}</p>
                          <p>{q.institution}</p>
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
                    <div className="input-group">
                      <label>Degree Name</label>
                    <input placeholder="e.g Bachelor of Science"
                    onChange={(e) => setQualForm({...qualForm, degree_name: e.target.value})
                    }
                    />
                    <label>Institution</label>
                    <input placeholder="e.g New Jersey Institute of Technology"
                    onChange={(e) => setQualForm({...qualForm, institution: e.target.value})
                  }
                  />
                  <label>Field of Study</label>
                  <input placeholder="e.g Medicine"
                  onChange={(e) => setQualForm({...qualForm, field_of_study: e.target.value})
                }
                  />
                  <label>Year Completed</label>
                  <input placeholder="e.g 2026"
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
                          <div key={c.id} className="item-card">
                            <a href={c.document_url} target="_blank" rel="noopener noreferrer">
                              View Document
                            </a>
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
                      <>
                      <input type = "file"
                      onChange={(e) => setFile(e.target.files[0])}
                      />
                      <div className="modal-footer">
                      <button className="modal-btns" onClick={handleSubmit}>Submit</button>
                      <button className="modal-btns" onClick={() => setShowNewForm(false)}>
                        Back
                        </button>
                        </div>
                      </>
                      
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
