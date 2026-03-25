import React from "react";
import "../styles/Dashboard.css";
import "../styles/Login.css";
import googleLogo from "../images/google.png";

function Login() {
  return (
    <div className="dashboard-page">
        <div className="container">
        <h2 className="text">Log In</h2>
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
            <button>Log in</button>
            <div className="divider">or continue with</div>
            <button className="google-btn"><img src={googleLogo} alt="" className="google-icon"
            />Google</button>
            <div className="signup-link">Don’t have an account? <span>Sign up</span></div>
        </div>
        </div>
      </div>
    
  )
}  


export default Login;