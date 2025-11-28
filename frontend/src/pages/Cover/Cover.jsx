import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, Map, User, BarChart } from "lucide-react";

function Cover() {
  const { user } = useAuth();

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] flex flex-col items-center px-6 pt-10 pb-20 bg-background">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-2 text-blue-700 dark:text-blue-300">
        {user ? `Welcome back, ${user.username}!` : "Welcome to UCLA Delivery Network"}
      </h1>
      <p className="text-muted-foreground mb-10 text-center max-w-lg">
        Fast, reliable peer-to-peer deliveries across campus — powered by Bruins.
      </p>

      {/* ACTION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">

        {/* NEW REQUEST */}
        <Link to="/requests/new">
          <div className="p-6 rounded-xl border border-border shadow hover:shadow-md bg-card transition group cursor-pointer">
            <PlusCircle className="w-8 h-8 mb-3 text-blue-600 group-hover:text-blue-700" />
            <h3 className="font-semibold text-lg">Create a Request</h3>
            <p className="text-sm text-muted-foreground">
              Need food? Package? Something delivered? Post a request.
            </p>
          </div>
        </Link>

        {/* VIEW REQUESTS */}
        <Link to="/requests">
          <div className="p-6 rounded-xl border border-border shadow hover:shadow-md bg-card transition group cursor-pointer">
            <Package className="w-8 h-8 mb-3 text-blue-600 group-hover:text-blue-700" />
            <h3 className="font-semibold text-lg">Browse Requests</h3>
            <p className="text-sm text-muted-foreground">
              See open deliveries and help someone out.
            </p>
          </div>
        </Link>

        {/* MAP */}
        <Link to="/dashboard">
          <div className="p-6 rounded-xl border border-border shadow hover:shadow-md bg-card transition group cursor-pointer">
            <Map className="w-8 h-8 mb-3 text-blue-600 group-hover:text-blue-700" />
            <h3 className="font-semibold text-lg">Open Map</h3>
            <p className="text-sm text-muted-foreground">
              View all active locations and routes.
            </p>
          </div>
        </Link>

        {/* PROFILE */}
        <Link to="/profile">
          <div className="p-6 rounded-xl border border-border shadow hover:shadow-md bg-card transition group cursor-pointer">
            <User className="w-8 h-8 mb-3 text-blue-600 group-hover:text-blue-700" />
            <h3 className="font-semibold text-lg">Your Profile</h3>
            <p className="text-sm text-muted-foreground">
              Manage account settings, image, and details.
            </p>
          </div>
        </Link>

        {/* STATS — OPTIONAL */}
        <div className="p-6 rounded-xl border border-border shadow bg-card">
          <BarChart className="w-8 h-8 mb-3 text-blue-600" />
          <h3 className="font-semibold text-lg">Your Stats</h3>
          <p className="text-sm text-muted-foreground">Deliveries completed: 0</p>
          <p className="text-sm text-muted-foreground">Requests made: 0</p>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-12 text-xs text-muted-foreground">
        UCLA Delivery Network — Built by Bruins 💙🐻💛
      </div>
    </div>
  );
}

export default Cover;
