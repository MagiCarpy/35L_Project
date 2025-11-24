import { useOutletContext, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";

// FIXME: add error handling
// maybe make parent component that keeps track of user creds?
// because don't want to have to rewrite get user logic

function Profile() {
  const { user, updateUser } = useAuth();
  const [pfp, setPfp] = useState(null);
  const [currentProfileImg, setCurrentProfileImg] = useState(
    user?.profileImg || null
  );

  // Sync local state with user state
  useEffect(() => {
    if (user?.profileImg && user.profileImg !== currentProfileImg) {
      setCurrentProfileImg(user.profileImg);
    }
  }, [user?.profileImg]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPfp(file);
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
      if (!resp.ok) throw new Error("Upload failed.");
      const data = await resp.json();

      console.log("File uploaded successfully:");

      // immediately update local pfp and user pfp
      setCurrentProfileImg(data.imageUrl);
      updateUser({ profileImg: data.imageUrl });

      setPfp(null);
      e.target.reset();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const profileImgSrc = currentProfileImg
    ? `/public/${currentProfileImg}`
    : "/default.jpg";

  return (
    user && (
      <div className="max-w-[800px] mx-auto p-8 text-center font-sans">
        <h2 className="text-3xl font-semibold mb-6">Profile</h2>
        <img
          className="w-[200px] h-[200px] rounded-lg shadow-sm mt-4 mx-auto object-cover"
          src={profileImgSrc}
          alt="Profile"
        />
        <form
          className="flex flex-row items-center gap-4 mb-8 justify-center mt-8"
          onSubmit={handleSubmit}
        >
          <input
            className="p-2 text-base border border-input rounded w-[200px] bg-background cursor-pointer hover:border-primary"
            type="file"
            onChange={handleFileChange}
          />
          <Button className="py-3 px-6 cursor-pointer" type="submit">
            Upload
          </Button>
        </form>
        <div className="mb-8 space-y-2">
          <p className="text-lg">
            <b>UserId:</b> {user.userId || "N/A"}
          </p>
          <p className="text-lg">
            <b>Username:</b> {user.username || "N/A"}
          </p>
          <p className="text-lg">
            <b>Email:</b> {user.email || "N/A"}
          </p>
        </div>
      </div>
    )
  );
}
export default Profile;
