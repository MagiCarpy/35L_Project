import React from "react";

function Home(props) {
  const user = props.user;
  if (user) {
    return (
      <div className="home-container">
        <h2>🐻 UCLA Delivery Network 🐻</h2>
        <p>Welcome back, {user.name}</p>
        <p>Post a delivery request, or pick up a delivery request?</p>

        <a href="/requests/new">
          <button className="home-btn">Create Requests</button>
        </a>

        <a href="/requests">
          <button className="home-btn">View Requests</button>
        </a>
      </div>
    );
  } else {
    return (
      <div className="home-container">
        <h2>🐻 UCLA Delivery Network 🐻</h2>
        <p>Please login or signup to start sending or accepting delivery requests!</p>

        <a href="/login">
          <button className="home-btn">Login</button>
        </a>
        <a href="/signup">
          <button className="home-btn">Signup</button>
        </a>
      </div>
    );
  }
}

export default Home;