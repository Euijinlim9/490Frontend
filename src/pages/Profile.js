import React from "react";
import "../styles/Profile.css";

function Profile() {
  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-content">
          <div className="profile-left">
            <h1 className="profile-title">Profile Settings</h1>

            <div className="profile-avatar-wrapper">
              <img
                className="profile-avatar"
                src=""
                alt="Profile avatar"
              />
            </div>

            <div className="profile-name">Emily Johnson</div>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="stat-number">23</div>
                <div className="stat-label">Workouts</div>
              </div>

              <div className="profile-stat-divider"></div>

              <div className="profile-stat">
                <div className="stat-number">13</div>
                <div className="stat-label">Friends</div>
              </div>

              <div className="profile-stat-divider"></div>

              <div className="profile-stat">
                <div className="stat-number">28</div>
                <div className="stat-label">Streak</div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="upload-btn">Upload new avatar</button>
              <button className="signout-btn">Sign Out</button>
            </div>
          </div>

          <div className="profile-right">
            <div className="profile-form-header">
              <h2 className="form-section-title">Basic Info</h2>

              <div className="form-actions">
                <button className="cancel-btn">Cancel</button>
                <button className="save-btn">Save</button>
              </div>
            </div>

            <div className="section-divider"></div>

            <form className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="firstName"
                    name="firstName"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    className="form-input"
                    type="text"
                    id="lastName"
                    name="lastName"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Title
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="title"
                  name="title"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-input"
                  type="email"
                  id="email"
                  name="email"
                />
              </div>

              <div className="about-section">
                <h2 className="form-section-title">About Me</h2>
                <div className="section-divider"></div>

                <div className="form-group">
                  <label className="form-label" htmlFor="aboutMe">
                    About Me
                  </label>
                  <textarea
                    className="form-textarea"
                    id="aboutMe"
                    name="aboutMe"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;