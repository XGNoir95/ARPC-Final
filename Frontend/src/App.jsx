// src/App.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./Pages/Home";
import ScrollToTopButton from "./Components/ScrollToTopButton";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import TeamPage from "./Pages/Team";
import Profile from "./Pages/Profile";
import { RouteTransitionProvider } from "./RouteTransitionContext";

function App() {
  // Pages cannot rewrite SPA routes. Hash routing makes direct links reload safely.
  const isGitHubPages = import.meta.env.VITE_GITHUB_PAGES === "true";
  const Router = isGitHubPages ? HashRouter : BrowserRouter;

  return (
    <Router basename={isGitHubPages ? undefined : import.meta.env.BASE_URL}>
      <AppContent />
    </Router>
  );
}

// This component can safely use hooks like useLocation
function AppContent() {
  const location = useLocation();

  // Track previous pathname globally
  const [prevPathname, setPrevPathname] = useState(null);
  const prevLocationRef = useRef(location);

  useEffect(() => {
    setPrevPathname(prevLocationRef.current.pathname);
    prevLocationRef.current = location;
  }, [location]);

  // Treat both login and register as auth pages (hide navbar/footer)
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <RouteTransitionProvider
      value={{ prevPathname, currentPathname: location.pathname }}
    >
      <div className="min-h-screen flex flex-col text-white bg-white">
        {/* NAVBAR with fixed positioning to avoid z-index issues */}
        <div
          className={`transition-all duration-500 ease-in-out relative z-50
        ${
          isAuthPage
            ? "max-h-0 opacity-0 -translate-y-4"
            : "max-h-[140px] opacity-100 translate-y-0"
        }`}
          style={{ overflow: isAuthPage ? "hidden" : "visible" }}
        >
          <Navbar />
        </div>

        {/* MAIN CONTENT - add margin top to account for navbar space */}
        <main className={`flex-1 ${isAuthPage ? "" : "lg:mt-0"}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        {/* FOOTER with smooth hide/show */}
        <div
          className={`transition-all duration-500 ease-in-out
        ${
          isAuthPage
            ? "max-h-0 opacity-0 translate-y-4 overflow-hidden"
            : "max-h-[700px] opacity-100 translate-y-0"
        }`}
        >
          <Footer />
        </div>

        {/* Global scroll-to-top button */}
        <ScrollToTopButton />
      </div>
    </RouteTransitionProvider>
  );
}

export default App;
