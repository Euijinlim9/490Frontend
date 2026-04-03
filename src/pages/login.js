import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import googleLogo from "../images/google.png";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="text">Log in</div>
      <div>
        <div className="inputs">
          <div className="input">
            <input type="email" placeholder="Email" />
          </div>
          <div className="input">
            <input type="password" placeholder="Password" />
          </div>
        </div>
        <div className="forgot-pass">Forgot your Password?</div>
        <button className="loginbutton" onClick={() => navigate("/home")}>
          Log in
        </button>
        <div className="divider">or continue with</div>
        <button
          className="google-btn"
          onClick={() => {
            window.location.href = "http://localhost:4000/auth/google";
          }}
        >
          <img src={googleLogo} alt="" className="google-icon" />
          Google
        </button>
        <div className="signup-link">
          Don’t have an account?
          <span onClick={() => navigate("/signup")}>Sign up</span>
        </div>
      </div>
    </div>
  );
}
export default Login;
