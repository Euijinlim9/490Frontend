import React from "react";
import "../styles/Profile.css";
import userimg from "../images/user.svg";

function Profile() {
  return (
    <div className="profile-page">
      <div className="container-left">
        <div className="profile-text">Profile Settings</div>
        <img src={userimg} alt="" className="avatar" />
        <div className="profile-name">First Name Last Name</div>
        <button className="upload-btn">Upload new image</button>
        <button className="signout-btn">Sign out</button>    
        <button className="delete-btn">Delete Account</button>  
        </div>
      <div className="container-right">
        <h3>BASIC INFORMATION</h3>
        <div className="line"></div>
        <div className="name">
          <div className="input-group">
            <label htmlFor="firstname">First Name</label>
            <input id="firstname" type="text" />
          </div>
          <div className="input-group">
            <label htmlFor="lastname">Last Name</label>
            <input id="lastname" type="text" />
          </div>
        </div>
        <div className="input-group email-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="text" />
        </div>
        <h3>UPDATE PERSONAL GOALS</h3>
        <div className="line"></div>
        <div className="input-group goals">
        <label htmlFor="goals">Goals</label>
        <input id="goals" type="text" />
        </div>
      </div>
    </div>
  )
}

export default Profile;