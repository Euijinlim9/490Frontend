import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import googleLogo from "../images/google.png";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setUser, setActiveRole } = useContext(AuthContext);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setActiveRole(data.user.role);
        navigate("/dashboard");
      } else {
        setError(data.message || data.error);
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your FitnessFR account</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-form">
          <div className="login-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="login-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="login-forgot">Forgot your password?</div>

          <button className="login-btn" onClick={handleLogin}>
            Sign In
          </button>
        </div>

        <div className="login-divider">
          <span>or continue with</span>
        </div>

        <button className="login-google-btn" onClick={handleGoogleLogin}>
          <img src={googleLogo} alt="Google" className="login-google-logo" />
          Google
        </button>

        <p className="login-signup-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
export default Login;
