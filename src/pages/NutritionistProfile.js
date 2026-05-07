import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import userimg from "../images/user.svg";
import "../styles/Profile.css";

function NutritionistProfile() {
  const { user, setUser } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    price: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/profile/nutritionist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setForm({
          first_name: data.user.first_name || "",
          last_name: data.user.last_name || "",
          phone: data.user.phone || "",
          price: data.nutritionist.price || "",
          description: data.nutritionist.description || "",
        });
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/profile/nutritionist", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.message || "Failed to update profile"); return; }
      setUser((prev) => ({ ...prev, ...data.user }));
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch { setMessage("Something went wrong."); }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
      }
    } catch { setMessage("Something went wrong."); }
  };

  if (loading) return <p style={{ color: "#fff", padding: 32 }}>Loading...</p>;

  return (
    <div className="profile-page">
      <div className="container-left">
        <div className="profile-text">Profile Settings</div>
        {user?.profile_pic ? (
          <img
            src={user.profile_pic.startsWith("http") ? user.profile_pic : `http://localhost:4000${user.profile_pic}`}
            alt="Profile"
            className="avatar"
          />
        ) : (
          <img src={userimg} alt="" className="avatar" />
        )}
        <div className="profile-name">{user?.first_name} {user?.last_name}</div>
        <div className="profile-badge">Nutritionist</div>
        <input type="file" accept="image/png, image/jpeg, image/jpg" ref={fileRef} style={{ display: "none" }} onChange={handlePictureUpload} />
        <button className="upload-btn" onClick={() => fileRef.current.click()}>Upload new image</button>
      </div>

      <div className="container-right">
        <h3>BASIC INFORMATION</h3>
        <div className="line"></div>
        {message && <div className="profile-message">{message}</div>}

        <div className="name">
          <div className="input-group">
            <label>First Name</label>
            <input name="first_name" type="text" value={form.first_name} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Last Name</label>
            <input name="last_name" type="text" value={form.last_name} onChange={handleChange} />
          </div>
        </div>

        <div className="input-group email-group">
          <label>Email</label>
          <input type="text" defaultValue={user?.email || ""} disabled />
        </div>

        <div className="input-group phone-group">
          <label>Phone Number</label>
          <input name="phone" type="text" value={form.phone} onChange={handleChange} />
        </div>

        <h3>NUTRITIONIST PROFILE</h3>
        <div className="line"></div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            name="description"
            rows="4"
            placeholder="Tell clients about yourself, your approach, and your specialties..."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Session Price ($)</label>
          <input name="price" type="number" placeholder="0.00" value={form.price} onChange={handleChange} />
        </div>

        <button className="save-btn" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
}

export default NutritionistProfile;
