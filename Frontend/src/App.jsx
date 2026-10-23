// src/App.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useAuth } from './contexts/AuthContext';
import { useContent } from './contexts/ContentContext';
import AuthProvider from './contexts/AuthProvider';
import ThemeProvider from './contexts/ThemeProvider';
import FloatingControls from './Components/FloatingControls';
import SessionGate from './Components/SessionGate';
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ContentProvider from "./contexts/ContentProvider";
import AccountRecovery from "./Pages/AccountRecovery";
import Learning from "./Pages/Learning";
import AdminWorkspace from "./Pages/Admin/Workspace";
import TeamPage from "./Pages/Team";
import Catalogue from "./Pages/Catalogue";
import Gallery from "./Pages/Gallery";
import Profile from "./Pages/Profile";
import Join from "./Pages/Join";
import Enrollment from "./Pages/Enrollment";
import { enrollmentFromPath } from "./utils/enrollment";
import { RouteTransitionProvider } from "./contexts/RouteTransitionProvider";
import AnimatedPage from "./Components/AnimatedPage";
import { prepareRoute } from "./utils/prepareRoute";
import PageErrorBoundary from './Components/PageErrorBoundary';
import { StatePage } from './Components/StateView';
import { isAdminSite } from './utils/adminSite';

const pageNames = {
  "/": "home page", "/team": "panel", "/catalogue": "catalogue", "/gallery": "gallery",
  "/profile": "profile", "/login": "sign in", "/register": "registration",
  "/join": "membership application", "/admin": "admin dashboard",
};

function App() {
  // Pages cannot rewrite SPA routes. Hash routing makes direct links reload safely.
  const isGitHubPages = import.meta.env.VITE_GITHUB_PAGES === "true";
  const Router = isGitHubPages ? HashRouter : BrowserRouter;

  return (
    <Router basename={isGitHubPages ? undefined : import.meta.env.BASE_URL}>
      <ThemeProvider><AuthProvider><ContentProvider><AppContent /></ContentProvider></AuthProvider></ThemeProvider>
    </Router>
  );
}

// This component can safely use hooks like useLocation
function AppContent() {
  const adminSite = isAdminSite();
  const {profile,status}=useAuth();
  const publicContent=useContent();
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const pageKey = adminSite && isAdminPage ? '/admin' : location.pathname;
  const [readyPathname, setReadyPathname] = useState(location.pathname);
  const loading = !isAdminPage && readyPathname !== location.pathname;

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

  // Account and admin pages use their own layouts without public navigation or footer.
  const isAuthPage =
    ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/learn"].includes(location.pathname);
  const standalone = adminSite && (isAuthPage || isAdminPage) || location.pathname === '/learn';
  const isHomePage = location.pathname === "/";
  const hasPhotoHero = isHomePage || location.pathname === "/team" || location.pathname === "/catalogue" || location.pathname === "/gallery" || location.pathname === "/join";
  const enrollment = enrollmentFromPath(location.pathname);
  const participantRoute=location.pathname==='/join'||/^\/enroll\//.test(location.pathname);
  let programmeId='';try{programmeId=decodeURIComponent(location.pathname.split('/')[3]||'');}catch{/* Invalid links use the not-found view. */}
  const programme=publicContent?.programmes.find(item=>item.id===programmeId&&item.kind===location.pathname.split('/')[2]);
  const enrollmentHasHero=/^\/enroll\//.test(location.pathname)&&(publicContent?Boolean(programme&&programme.registrationOpen!==false):Boolean(enrollment));
  const overlayNavigation=(hasPhotoHero || enrollmentHasHero)&&!(participantRoute&&(profile||status==='error'));

  return (
    <RouteTransitionProvider
      value={{ prevPathname, currentPathname: location.pathname }}
    >
      <div className="relative flex min-h-screen flex-col bg-page text-ink">
        {!standalone && <div className={`z-50 ${overlayNavigation ? "absolute inset-x-0 top-0" : "relative"}`}>
          <Navbar blendWithHero={overlayNavigation} loading={loading || participantRoute&&status==='checking'} />
        </div>}

        <AnimatedPage key={pageKey} pathname={location.pathname} loading={loading} focusOnEntry={prevPathname !== null}>
          <PageErrorBoundary key={pageKey} resetKey={location.pathname} standalone={standalone}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/join" element={<SessionGate mode="applicant"><Join /></SessionGate>} />
            <Route path="/enroll/:kind/:id" element={<SessionGate mode="applicant"><Enrollment /></SessionGate>} />
            {adminSite && <><Route path="/login" element={<SessionGate mode="guest"><Login /></SessionGate>} />
            <Route path="/register" element={<SessionGate mode="guest"><Register /></SessionGate>} />
            <Route path="/forgot-password" element={<AccountRecovery key={location.search} />} />
            <Route path="/reset-password" element={<AccountRecovery key={location.search} />} />
            <Route path="/verify-email" element={<AccountRecovery key={location.search} verify />} />
            <Route path="/admin/*" element={<AdminWorkspace />} /></>}
            <Route path="/learn" element={<SessionGate mode="applicant"><Learning /></SessionGate>} />
            <Route path="*" element={<StatePage kind="missing" title="We can’t find that page." description="The link may have changed, or the page is no longer available. You can return home or explore the club’s programmes." actions={[{label:'Go to home',to:'/'}, {label:'Browse programmes',to:'/catalogue',secondary:true}]}/>} />
          </Routes>
          </PageErrorBoundary>
        </AnimatedPage>

        {!standalone && <Footer loading={loading} />}
        {/* Keep the live announcement mounted and outside the busy main region. */}
        <span role="status" aria-live="polite" className="sr-only">
          {loading ? `Loading ${enrollment ? `${enrollment.label.toLowerCase()} enrollment` : pageNames[location.pathname] ?? (isAdminPage ? "admin workspace" : "page")}…` : ""}
        </span>

        <FloatingControls />
      </div>
    </RouteTransitionProvider>
  );
}

export default App;
