import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Signup.css";
import googleLogo from "../images/google.png";
import { AuthContext } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();

  const { setUser } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("client");
  const [success, setSuccess] = useState("");
  const [coachCertification, setCoachCertification] = useState([]);
  const [clientForm, setClientForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [coachForm, setCoachForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleClientChange = (e) => {
    setClientForm({
      ...clientForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleCoachChange = (e) => {
    setCoachForm({ ...coachForm, [e.target.name]: e.target.value });
  };

  const handleClientSignup = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth/register/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });

      const data = await res.json();
      console.log("Data:", data);
      console.log("Token:", data.token);

      if (res.ok) {
        console.log("Registration response:", data);
        console.log("Token received:", data.token);
        localStorage.setItem("token", data.token);

        const meRes = await fetch("http://localhost:4000/auth/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const meData = await meRes.json();

        if (meRes.ok) {
          setUser(meData.user);
        }
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          navigate("/survey");
        }, 2000);
      } else {
        setError(data.message || data.error);
      }
    } catch (error) {
      setError("Something went wrong!");
    }
  };

  const handleCoachSignup = async () => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("first_name", coachForm.first_name);
      formData.append("last_name", coachForm.last_name);
      formData.append("email", coachForm.email);
      formData.append("password", coachForm.password);
      formData.append("phone", coachForm.phone);

      coachCertification.forEach((file) => {
        formData.append("certification", file);
      });

      const res = await fetch("http://localhost:4000/auth/register/coach", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        const meRes = await fetch("http://localhost:4000/auth/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const meData = await meRes.json();
        if (meRes.ok) {
          setUser(meData.user);
        }
        setSuccess("Coach account created! Redirecting...");
        setTimeout(() => {
          navigate("/survey");
        }, 2000);
      } else {
        setError(data.message || data.error);
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };
  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">
          Create your FitnessFR account to get started
        </p>

        {/* Toggle */}
        <div className="role-toggle">
          <button
            className={`toggle-btn ${activeTab === "client" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("client");
              setError("");
            }}
          >
            Client
          </button>
          <button
            className={`toggle-btn ${activeTab === "coach" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("coach");
              setError("");
            }}
          >
            Coach
          </button>
          <div
            className="toggle-slider"
            style={{
              transform:
                activeTab === "coach" ? "translateX(100%)" : "translateX(0)",
            }}
          />
        </div>

        {error && <div className="signup-error">{error}</div>}
        {success && <div className="signup-success">{success}</div>}

        {/* Client Form */}
        {activeTab === "client" && (
          <div className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={clientForm.first_name}
                  onChange={handleClientChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={clientForm.last_name}
                  onChange={handleClientChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={clientForm.email}
                onChange={handleClientChange}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={clientForm.password}
                onChange={handleClientChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="(555) 123-4567"
                value={clientForm.phone}
                onChange={handleClientChange}
              />
            </div>
            <button className="signup-btn" onClick={handleClientSignup}>
              Create Client Account
            </button>
          </div>
        )}

        {/* Coach Form */}
        {activeTab === "coach" && (
          <div className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={coachForm.first_name}
                  onChange={handleCoachChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={coachForm.last_name}
                  onChange={handleCoachChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={coachForm.email}
                onChange={handleCoachChange}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                value={coachForm.password}
                onChange={handleCoachChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="(555) 123-4567"
                value={coachForm.phone}
                onChange={handleCoachChange}
              />
            </div>
            <div className="upload-cert-btn">
            <label>Upload Certification</label>
            <input 
            type="file" multiple
            accept=".pdf, .png, .jpg, .jpeg"
            onChange={(e) => setCoachCertification(Array.from(e.target.files))}/>
            </div>
            <button className="signup-btn" onClick={handleCoachSignup}>
              Create Coach Account
            </button>
          </div>
        )}

        <div className="signup-divider">
          <span>or continue with</span>
        </div>

        <button className="google-signup-btn" onClick={handleGoogleSignup}>
          <img src={googleLogo} alt="Google" className="google-logo" />
          Google
        </button>

        <p className="signin-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
