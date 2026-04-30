import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Signup.css";
import googleLogo from "../images/google.png";
import { AuthContext } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("client");
  const [professionalRole, setProfessionalRole] = useState("coach");
  const [coachCertification, setCoachCertification] = useState([]);

  const [clientForm, setClientForm] = useState({ first_name: "", last_name: "", email: "", password: "", phone: "" });
  const [proForm, setProForm] = useState({ first_name: "", last_name: "", email: "", password: "", phone: "" });

  const handleClientChange = (e) => setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  const handleProChange = (e) => setProForm({ ...proForm, [e.target.name]: e.target.value });

  const handleClientSignup = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/register/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        const meRes = await fetch("http://localhost:4000/auth/me", { headers: { Authorization: `Bearer ${data.token}` } });
        const meData = await meRes.json();
        if (meRes.ok) setUser(meData.user);
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/survey"), 2000);
      } else {
        setError(data.message || data.error);
      }
    } catch {
      setError("Something went wrong");
    }
  };

  const handleCoachSignup = async () => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("first_name", proForm.first_name);
      formData.append("last_name", proForm.last_name);
      formData.append("email", proForm.email);
      formData.append("password", proForm.password);
      formData.append("phone", proForm.phone);
      coachCertification.forEach((file) => formData.append("certification", file));

      const res = await fetch("http://localhost:4000/auth/register/coach", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        const meRes = await fetch("http://localhost:4000/auth/me", { headers: { Authorization: `Bearer ${data.token}` } });
        const meData = await meRes.json();
        if (meRes.ok) setUser(meData.user);
        setSuccess("Coach account created! Redirecting...");
        setTimeout(() => navigate("/survey"), 2000);
      } else {
        setError(data.message || data.error);
      }
    } catch {
      setError("Something went wrong");
    }
  };

  const handleNutritionistSignup = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/register/nutritionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        const meRes = await fetch("http://localhost:4000/auth/me", { headers: { Authorization: `Bearer ${data.token}` } });
        const meData = await meRes.json();
        if (meRes.ok) setUser(meData.user);
        setSuccess("Nutritionist account created! Redirecting...");
        setTimeout(() => navigate("/survey"), 2000);
      } else {
        setError(data.message || data.error);
      }
    } catch {
      setError("Something went wrong");
    }
  };

  const handleProSignup = () => {
    if (professionalRole === "coach") handleCoachSignup();
    else if (professionalRole === "nutritionist") handleNutritionistSignup();
    else handleCoachSignup();
  };

  const getProBtnLabel = () => {
    if (professionalRole === "coach") return "Create Coach Account";
    if (professionalRole === "nutritionist") return "Apply as Nutritionist";
    return "Apply as Coach & Nutritionist";
  };

  const handleGoogleSignup = () => { window.location.href = "http://localhost:4000/auth/google"; };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Create your FitnessFR account to get started</p>

        <div className="role-toggle">
          <button className={`toggle-btn ${activeTab === "client" ? "active" : ""}`} onClick={() => { setActiveTab("client"); setError(""); }}>
            Client
          </button>
          <button className={`toggle-btn ${activeTab === "professional" ? "active" : ""}`} onClick={() => { setActiveTab("professional"); setError(""); }}>
            Coach / Nutritionist
          </button>
          <div className="toggle-slider" style={{ transform: activeTab === "professional" ? "translateX(100%)" : "translateX(0)" }} />
        </div>

        {error && <div className="signup-error">{error}</div>}
        {success && <div className="signup-success">{success}</div>}

        {activeTab === "client" && (
          <div className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" placeholder="John" value={clientForm.first_name} onChange={handleClientChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" placeholder="Doe" value={clientForm.last_name} onChange={handleClientChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="john@example.com" value={clientForm.email} onChange={handleClientChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Password" value={clientForm.password} onChange={handleClientChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" placeholder="(555) 123-4567" value={clientForm.phone} onChange={handleClientChange} />
            </div>
            <button className="signup-btn" onClick={handleClientSignup}>Create Client Account</button>
          </div>
        )}

        {activeTab === "professional" && (
          <div className="signup-form">
            <div className="form-group">
              <label>Applying as</label>
              <select className="pro-role-select" value={professionalRole} onChange={(e) => setProfessionalRole(e.target.value)}>
                <option value="coach">Coach</option>
                <option value="nutritionist">Nutritionist</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="first_name" placeholder="John" value={proForm.first_name} onChange={handleProChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="last_name" placeholder="Doe" value={proForm.last_name} onChange={handleProChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="john@example.com" value={proForm.email} onChange={handleProChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Min. 8 characters" value={proForm.password} onChange={handleProChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" placeholder="(555) 123-4567" value={proForm.phone} onChange={handleProChange} />
            </div>
            {(professionalRole === "coach" || professionalRole === "both") && (
              <div className="upload-zone">
                <div className="upload-zone-icon">↑</div>
                <p className="upload-zone-title">Drag and drop files here or upload</p>
                <p className="upload-zone-sub">Accepted file types: PDF, PNG, JPG, JPEG</p>
                <label className="upload-zone-btn">
                  Upload
                  <input type="file" multiple accept=".pdf, .png, .jpg, .jpeg" style={{ display: "none" }} onChange={(e) => setCoachCertification(Array.from(e.target.files))} />
                </label>
                {coachCertification.length > 0 && (
                  <div className="upload-file-list">
                    <p className="upload-count">0 of {coachCertification.length} Files uploaded</p>
                    {coachCertification.map((file, i) => (
                      <div key={i} className="upload-file-row">
                        <div className="upload-file-info">
                          <span className="upload-file-icon">📄</span>
                          <span className="upload-file-name">{file.name}</span>
                          <span className="upload-file-size">{(file.size / (1024 * 1024)).toFixed(1)}mb</span>
                        </div>
                        <div className="upload-progress-bar"><div className="upload-progress-fill" style={{ width: "100%" }} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button className="signup-btn" onClick={handleProSignup}>{getProBtnLabel()}</button>
          </div>
        )}

        {activeTab === "client" && (
          <>
            <div className="signup-divider"><span>or continue with</span></div>
            <button className="google-signup-btn" onClick={handleGoogleSignup}>
              <img src={googleLogo} alt="Google" className="google-logo" />
              Google
            </button>
          </>
        )}

        <p className="signin-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
