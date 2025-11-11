import React from "react";
import MapScreen from "../Map/Map";

function Home({ user }) {
  let userMessage;
  if (user) {
    userMessage = (
      <div style={{ textAlign: "center" }}>
        <h2>🐻 UCLA Delivery NetWork 🐻</h2>
        <p>Welcome back, {user.username}</p>
        <p>Post a delivery request, or pick up a delivery request?</p>

        <a href="/requests/new">
          <button>Create Requests</button>
        </a>

        <a href="/requests">
          <button>View Requests</button>
        </a>
      </div>
    );
  } else {
    userMessage = (
      <div style={{ textAlign: "center" }}>
        <h2>🐻 UCLA Delivery NetWork 🐻</h2>
        <p>
          Please login or signup to starting sending or accepting delivery
          request!
        </p>
      </div>
    );
  }
  return (
    <>
      {userMessage}
      <MapScreen />
    </>
  );
}

export default Home;
