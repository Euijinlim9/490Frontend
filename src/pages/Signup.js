import React from "react";
import {useNavigate} from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/Login.css";
import googleLogo from "../images/google.png";

function Signup(){

    const navigate = useNavigate();
    return (

        <div className="signup-page">
            <div className="container-left">
                <div className="text">Sign Up for Client</div>
            <div>
            <div className="inputs">
                <div className="input">
                    <input type="email" placeholder="Email" />
                </div>
                <div className="input">
                    <input type="password" placeholder="Password" />
                </div>
            </div>
            <button className="loginbutton" onClick={() => navigate("/home")}>Sign up</button>
            <div className="divider">or continue with</div>
            <button className="google-btn"><img src={googleLogo} alt="" className="google-icon"
            />Google</button>
            <div className="signup-link">Already have an account? 
                <span onClick={() => navigate("/")}>Sign in</span>
            </div>
        </div>
        </div>
        <div className="container-right">
        <div className="text">Sign Up for Coach</div>
        <div>
            <div className="inputs">
                <div className="input">
                    <input type="email" placeholder="Email" />
                </div>
                <div className="input">
                    <input type="password" placeholder="Password" />
                </div>
            </div>
            <button className="loginbutton" onClick={() => navigate("/home")}>Sign up</button>
            <button className="loginbutton">Upload Certification</button>
            <div className="divider">or continue with</div>
            <button className="google-btn"><img src={googleLogo} alt="" className="google-icon"
            />Google</button>
            <div className="signup-link">Already have an account? 
                <span onClick={() => navigate("/")}>Sign in</span>
            </div>
        </div>
        </div>
        </div>
  )
}

export default Signup;