import { useOutletContext, Navigate } from "react-router-dom";

// FIXME: add error handling
// maybe make parent component that keeps track of user creds?
// because don't want to have to rewrite get user logic

import React from "react";

function Profile({ user }) {
  if (!user) {
    return <p>No user data available.</p>;
  }

  return (
    <>
      <h2>Profile</h2>
      <p><b>UserId:</b> {user.id}</p>
      <p><b>Username:</b> {user.username}</p>
      <p><b>Email:</b> {user.email}</p>
    </>
  );
}


export default Profile; 