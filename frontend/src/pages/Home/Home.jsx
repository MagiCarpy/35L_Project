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
      <div className="w-full px-6 py-6 md:py-10 bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900/20 text-center rounded-b-2xl shadow-sm">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-200">
          UCLA Delivery Network
        </h1>

        <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
          Welcome back,
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            {" "}{user.username}
          </span>
        </p>

        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Need something delivered? Or want to help someone out?
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <Link to="/requests/new">
            <Button className="px-6 py-2 text-md bg-blue-600 hover:bg-blue-700 text-white shadow">
              Create Request
            </Button>
          </Link>

          <Link to="/requests">
            <Button className="px-6 py-2 text-md bg-gray-800 hover:bg-gray-900 text-white shadow">
              View Requests
            </Button>
          </Link>
        </div>
      </div>
    );
  } else {
    userMessage = (
      <div className="w-full px-6 py-6 md:py-10 bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900/20 text-center rounded-b-2xl shadow-sm">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-200">
          🐻 UCLA Delivery Network
        </h1>

        <p className="mt-3 text-gray-700 dark:text-gray-300">
          Sign in to start requesting or accepting deliveries!
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
