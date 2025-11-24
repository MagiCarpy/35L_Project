import React from "react";
import MapScreen from "../Map/Map";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Home() {
  const { user } = useAuth();
  let userMessage;
  if (user) {
    userMessage = (
      <div className="text-center pt-2 md:pt-4">
        <h2>🐻 UCLA Delivery NetWork 🐻</h2>
        <p>Welcome back, {user.username}</p>
        <p>Post a delivery request, or pick up a delivery request?</p>

        <div className="flex justify-center gap-4 mt-4">
          <Link to="/requests/new">
            <Button>Create Requests</Button>
          </Link>

          <Link to="/requests">
            <Button>View Requests</Button>
          </Link>
        </div>
      </div>
    );
  } else {
    userMessage = (
      <div className="text-center pt-2 md:pt-4">
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
