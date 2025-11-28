import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Menu, X, Package, PlusCircle, HomeIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import Cover from "./pages/Cover/Cover";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginSignup from "./pages/LoginSignup/LoginSignup";
import RequestsList from "./pages/Requests/RequestsList";
import NewRequest from "./pages/Requests/NewRequest";
import { useAuth } from "./context/AuthContext";
import { ModeToggle } from "@/components/mode-toggle";

function App() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) =>
    location.pathname === path
      ? "text-primary font-semibold"
      : "text-foreground dark:text-white hover:text-primary";

  return (
    <>
      {/* GLOBAL NAVBAR */}
      <header className="sticky top-0 z-[2000] w-full border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="w-full flex h-14 items-center justify-between px-4 md:px-8">

          {/* LEFT — Brand */}
          <div className="flex items-center gap-2 mr-4">
            <Link
              className="flex items-center gap-2 font-bold text-lg transition hover:opacity-80"
              to="/"
              onClick={closeMenu}
            >
              <span className="text-xl">🐻</span>
              <span className="tracking-tight">UCLA Delivery Network</span>
            </Link>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex flex-1 items-center justify-end space-x-6">
            {user && (
              <>
                <Link to="/dashboard" className={`text-sm text-foreground dark:text-white ${isActive("/")}`}>
                  <div className="flex items-center gap-1">
                    <HomeIcon className="w-4 h-4" /> Dashboard
                  </div>
                </Link>

                <Link to="/requests" className={`text-sm text-foreground dark:text-white ${isActive("/requests")}`}>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" /> Requests
                  </div>
                </Link>

                <Link to="/requests/new" className={`text-sm text-foreground dark:text-white ${isActive("/requests/new")}`}>
                  <div className="flex items-center gap-1">
                    <PlusCircle className="w-4 h-4" /> New Request
                  </div>
                </Link>

                <Link to="/profile" className={`text-sm text-foreground dark:text-white ${isActive("/profile")}`}>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" /> Profile
                  </div>
                </Link>
              </>
            )}

            {!user ? (
              <>
                <Link to="/login" className={`text-sm text-foreground dark:text-white ${isActive("/login")}`}>
                  Login
                </Link>
                <Link to="/signup" className={`text-sm text-foreground dark:text-white ${isActive("/signup")}`}>
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={logout}
                className="text-sm px-3 py-1.5 rounded-md 
                          bg-red-500 text-white 
                          hover:bg-red-600 
                          dark:bg-red-600 dark:hover:bg-red-700 
                          transition"
              >
                Logout
              </button>
            )}

            <ModeToggle />
          </div>

          {/* MOBILE NAV TOGGLE */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden border-t p-4 bg-background">
            <nav className="flex flex-col space-y-4">
              {user && (
                <>
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className={`text-sm text-foreground dark:text-white ${isActive("/")}`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/requests"
                    onClick={closeMenu}
                    className={`text-sm text-foreground dark:text-white ${isActive("/requests")}`}
                  >
                    Requests
                  </Link>

                  <Link
                    to="/requests/new"
                    onClick={closeMenu}
                    className={`text-sm text-foreground dark:text-white ${isActive("/requests/new")}`}
                  >
                    New Request
                  </Link>

                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className={`text-sm text-foreground dark:text-white ${isActive("/profile")}`}
                  >
                    Profile
                  </Link>
                </>
              )}

              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className={`text-sm text-foreground dark:text-white ${isActive("/login")}`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className={`text-sm text-foreground dark:text-white ${isActive("/signup")}`}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="text-left text-red-600 text-sm font-medium"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Cover />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/login" element={<LoginSignup signingUp={false} />} />
        <Route path="/signup" element={<LoginSignup signingUp={true} />} />

        <Route element={<ProtectedRoute redirect="/login" />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/requests" element={<RequestsList />} />
          <Route path="/requests/new" element={<NewRequest />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
