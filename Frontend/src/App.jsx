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
  const isHomePage = location.pathname === "/";

  return (
    <RouteTransitionProvider
      value={{ prevPathname, currentPathname: location.pathname }}
    >
      <div className="relative min-h-screen flex flex-col text-white bg-white">
        {/* On the home page, navigation sits over the hero photograph. */}
        <div
          className={`transition-all duration-500 ease-in-out z-50 ${isHomePage ? "absolute inset-x-0 top-0" : "relative"}
        ${
          isAuthPage
            ? "max-h-0 opacity-0 -translate-y-4"
            : "max-h-[140px] opacity-100 translate-y-0"
        }`}
          style={{ overflow: isAuthPage ? "hidden" : "visible" }}
        >
          <Navbar blendWithHero={isHomePage} />
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

        {/* The home footer also contains the founder's reflection. */}
        <div
          aria-hidden={isAuthPage}
          inert={isAuthPage}
          className={`transition-all duration-500 ease-in-out
        ${
          isAuthPage
            ? "max-h-0 opacity-0 translate-y-4 overflow-hidden"
            : "opacity-100 translate-y-0"
        }`}
        >
          <Footer includeQuote={isHomePage} />
        </div>

        {/* Global scroll-to-top button */}
        <ScrollToTopButton />
      </div>
    </RouteTransitionProvider>
  );
}

export default App;
