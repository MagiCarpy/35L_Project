import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginSignup from "./pages/LoginSignup/LoginSignup";
import RequestsList from "./pages/Requests/RequestsList";
import NewRequest from "./pages/Requests/NewRequest";
import RequestDetails from "./pages/Requests/RequestDetails";
import { useAuth } from "./context/AuthContext";
import { ModeToggle } from "@/components/mode-toggle";

function App() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-[2000] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-14 items-center justify-between px-4 md:px-8">
          <div className="mr-4 flex">
            <Link
              className="mr-6 flex items-center space-x-2 font-bold text-lg"
              to="/home"
              onClick={closeMenu}
            >
              UCLA Delivery NetWork
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-4">
              {user && (
                <Link
                  to="/profile"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Profile
                </Link>
              )}
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <Link
                  to="/home"
                  onClick={logout}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Logout
                </Link>
              )}
              <ModeToggle />
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden border-t p-4 bg-background">
            <nav className="flex flex-col space-y-4">
              {user && (
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Profile
                </Link>
              )}
              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <Link
                  to="/home"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Logout
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginSignup signingUp={false} />} />
        <Route path="/signup" element={<LoginSignup signingUp={true} />} />
        <Route element={<ProtectedRoute redirect="/login" />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/requests" element={<RequestsList />} />
          <Route path="/requests/new" element={<NewRequest />} />
          <Route path="/requests/:id" element={<RequestDetails />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
