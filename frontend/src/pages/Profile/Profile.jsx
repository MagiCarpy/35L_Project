import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";

// FIXME: add error handling
// maybe make parent component that keeps track of user creds?
// because don't want to have to rewrite get user logic

function Profile() {
  const { userId } = useOutletContext();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const profile = await getProfile();
      setUser(profile);
    };

    getUser();
  }, []);

  return (
    user && (
      <>
        <h2>Profile</h2>
        <p>
          <b>UserId:</b> {userId}
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

const getProfile = async () => {
  const resp = await fetch("/api/user/profile", {
    method: "GET",
    credentials: "include",
  });
  const data = await resp.json();
  console.log(data.user);
  return data.user;
};

export default Profile;
