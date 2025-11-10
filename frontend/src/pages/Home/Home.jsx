import React from "react";

function Home({ user }) {
  if (user) {
    return (
      <div style={{ textAlign: "center" }}>
        <h2>🐻 UCLA Delivery NetWork 🐻</h2>
        <p>Welcome back, {user.name}</p>
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
    return (
      <div style={{ textAlign: "center" }}>
        <h2>🐻 UCLA Delivery NetWork 🐻</h2>
        <p>
          Please login or signup to starting sending or accepting delivery
          request!
        </p>
      </div>
    );
  }
}

export default Home;
