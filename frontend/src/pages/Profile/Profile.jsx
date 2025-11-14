import { useOutletContext, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Profile.css";

// FIXME: add error handling
// maybe make parent component that keeps track of user creds?
// because don't want to have to rewrite get user logic

function Profile() {
  const [pfp, setPfp] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const user = useOutletContext();
  const handleFileChange = (e) => {
    setPfp(e.target.files[0]);
  };
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pfp) return;
    const formData = new FormData();
    formData.append("pfp", pfp);
    try {
      const resp = await fetch("/api/user/uploadPfp", {
        method: "POST",
        body: formData,
      });
      if (resp.status !== 200) throw new Error("Upload failed.");
      const data = await resp.json();
      console.log("File uploaded successfully:", data.imageUrl);
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    user && (
      <div className="profile-container">
        <h2 className="profile-title">Profile</h2>
        <img
          className="profile-image"
          src={imageUrl || "/public/default.jpg"}
          alt="Profile"
        />
        <form className="profile-form" onSubmit={handleSubmit}>
          <input
            className="profile-file-input"
            type="file"
            onChange={handleFileChange}
          />
          <button
            className="profile-upload-button"
            onClick={handleSubmit}
            type="submit"
          >
            Upload
          </button>
        </form>
        <div className="profile-info">
          <p>
            <b>UserId:</b> {user.userId || "N/A"}
          </p>
          <p>
            <b>Username:</b> {user.username || "N/A"}
          </p>
          <p>
            <b>Email:</b> {user.email || "N/A"}
          </p>
        </div>
      </div>
    )
  );
}
export default Profile;
