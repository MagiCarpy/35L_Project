import { useOutletContext, Navigate } from "react-router-dom";

// FIXME: add error handling
// maybe make parent component that keeps track of user creds?
// because don't want to have to rewrite get user logic

function Profile() {
  const user = useOutletContext();

  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  return (
    user && (
      <>
        <h2>Profile</h2>
        <p>
          <b>UserId:</b> {user.userId || "N/A"}
        </p>
        <p>
          <b>Username:</b> {user.username || "N/A"}
        </p>
        <p>
          <b>Email:</b> {user.email || "N/A"}
        </p>
      </>
    )
  );
}

export default Profile;
