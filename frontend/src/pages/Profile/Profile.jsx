import { useOutletContext } from "react-router-dom";

// FIXME: add error handling
// maybe make parent component that keeps track of user creds?
// because don't want to have to rewrite get user logic

function Profile() {
  const user = useOutletContext();

  return (
    user && (
      <>
        <h2>Profile</h2>
        <p>
          <b>UserId:</b> {user.userId}
        </p>
        <p>
          <b>Username:</b> {user.username}
        </p>
        <p>
          <b>Email:</b> {user.email}
        </p>
      </>
    )
  );
}

export default Profile;
