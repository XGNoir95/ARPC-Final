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
import Catalogue from "./Pages/Catalogue";
import Profile from "./Pages/Profile";
import Join from "./Pages/Join";
import Enrollment from "./Pages/Enrollment";
import { enrollmentFromPath } from "./utils/enrollment";
import { RouteTransitionProvider } from "./RouteTransitionContext";
import AnimatedPage from "./Components/AnimatedPage";
import { prepareRoute } from "./utils/prepareRoute";

const pageNames = {
  "/": "home page", "/team": "panel", "/catalogue": "catalogue",
  "/profile": "profile", "/login": "sign in", "/register": "registration",
  "/join": "membership application",
};

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
  const [readyPathname, setReadyPathname] = useState(location.pathname);
  const loading = readyPathname !== location.pathname;

  useEffect(() => {
    if (readyPathname === location.pathname) return;
    const controller = new AbortController();
    prepareRoute(location.pathname, {
      signal: controller.signal,
    }).then(() => {
      if (!controller.signal.aborted) setReadyPathname(location.pathname);
    });
    // A newer destination always wins, including Back/Forward navigation.
    return () => controller.abort();
  }, [location.pathname, readyPathname]);

  // Track previous pathname globally
  const [prevPathname, setPrevPathname] = useState(null);
  const prevLocationRef = useRef(location);

  useEffect(() => {
    setPrevPathname(prevLocationRef.current.pathname);
    prevLocationRef.current = location;
  }, [location]);

  // Auth pages keep their own navigation; the combined footer is shared by every route.
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isHomePage = location.pathname === "/";
  const hasPhotoHero = isHomePage || location.pathname === "/team" || location.pathname === "/catalogue" || location.pathname === "/join";
  const enrollment = enrollmentFromPath(location.pathname);
  const overlayNavigation = hasPhotoHero || Boolean(enrollment);

  return (
    <RouteTransitionProvider
      value={{ prevPathname, currentPathname: location.pathname }}
    >
      <div className="relative flex min-h-screen flex-col bg-white text-[#173d2e]">
        <div className={`z-50 ${overlayNavigation ? "absolute inset-x-0 top-0" : "relative"} ${isAuthPage ? "hidden" : ""}`}>
          <Navbar blendWithHero={overlayNavigation} loading={loading} />
        </div>

        <AnimatedPage key={location.pathname} pathname={location.pathname} loading={loading} focusOnEntry={prevPathname !== null}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/join" element={<Join />} />
            <Route path="/enroll/:kind/:id" element={<Enrollment />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </AnimatedPage>

        <Footer loading={loading} />
        {/* Keep the live announcement mounted and outside the busy main region. */}
        <span role="status" aria-live="polite" className="sr-only">
          {loading ? `Loading ${enrollment ? `${enrollment.label.toLowerCase()} enrollment` : pageNames[location.pathname] ?? "page"}…` : ""}
        </span>

        {/* Global scroll-to-top button */}
        <ScrollToTopButton />
      </div>
    </RouteTransitionProvider>
  );
}

export default App;
