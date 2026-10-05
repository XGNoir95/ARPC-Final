// src/Pages/Login.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScholarQuotesPanel from "../Components/ScholarQuotesPanel";
import AnimatedPage from "../Components/AnimatedPage";
import { useRouteTransition } from "../contexts/routeTransition";
import { publicAsset } from "../utils/publicAsset";

const Login = () => {
  const navigate = useNavigate();
  const { prevPathname } = useRouteTransition();
  const pageRef = useRef(null);

  // Slide animation only when coming from an auth page (login/register)
  const cameFromAuth =
    prevPathname === "/login" || prevPathname === "/register";
  const useAnimation = cameFromAuth;

  // scroll behaviour (same as your latest version)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    const prevHtmlOverflowY = html.style.overflowY;
    const prevBodyOverflowY = body.style.overflowY;
    const prevRootOverflowY = root ? root.style.overflowY : undefined;

    if (root) {
      root.style.overflowY = "visible";
    }

    const updateOverflow = () => {
      const isLg = window.innerWidth >= 1024;

      if (!isLg) {
        html.style.overflowY = prevHtmlOverflowY || "";
        return;
      }

      const contentEl = pageRef.current || body;
      const contentHeight = contentEl.scrollHeight;
      const viewportHeight = window.innerHeight;

      const ratio = contentHeight / viewportHeight;
      const threshold = 1.05;

      if (ratio > threshold) {
        html.style.overflowY = "auto";
      } else {
        html.style.overflowY = "hidden";
      }
    };

    updateOverflow();
    window.addEventListener("resize", updateOverflow);

    return () => {
      window.removeEventListener("resize", updateOverflow);
      html.style.overflowY = prevHtmlOverflowY;
      body.style.overflowY = prevBodyOverflowY;
      if (root) {
        root.style.overflowY = prevRootOverflowY ?? "";
      }
    };
  }, []);

  const content = (
    <section
      ref={pageRef}
      className="relative min-h-screen bg-white flex flex-col lg:flex-row justify-center lg:justify-start"
    >
      {/* Top-left back button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 md:top-6 md:left-6
                   inline-flex items-center gap-2
                   rounded-full bg-white/90 text-green-800
                   px-3 py-1.5 md:px-3 md:py-1.5
                   text-xs md:text-sm font-medium
                   shadow-xl hover:bg-gray-100 transition"
      >
        <span className="text-3xl md:text-3xl font-bold pb-1">←</span>
      </button>

      {/* LEFT – form column */}
      <div className="w-full lg:w-3/5 flex flex-col items-center lg:justify-center justify-start lg:py-0 sm:py-12">
        <div className="max-w-4xl w-full mx-auto px-6 sm:px-10 lg:px-25 pt-18 pb-10 lg:py-16">
          {/* Logo + name */}
          <div className="flex items-center gap-2 lg:gap-4 mb-10">
            <img
              src={publicAsset("/logo.jpg")}
              alt="ARPC Logo"
              className="h-36 w-36 rounded-full object-contain"
            />
            <div>
              <p className="text-sm tracking-[0.25em] uppercase text-green-700 font-semibold">
                ARPC
              </p>
              <p className="mt-1 text-[2rem] font-garamond font-semibold text-green-800">
                Ahsanullah Roh. Peace Club
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[1.9rem] md:text-[2.4rem] font-garamond font-bold text-green-800 mb-2">
              Sign in to your ARPC account
            </h1>
            <p className="text-[1rem] md:text-lg text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-green-800 font-semibold hover:underline"
              >
                Sign Up!
              </button>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-[0.9rem] md:text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                placeholder="abcd@gmail.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-[0.95rem] md:text-[1rem] text-green-700 font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-[0.9rem] md:text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                placeholder="••••••••"
              />
            </div>

            {/* Primary sign-in button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-[1.1rem] md:text-[1.1rem] font-semibold text-white shadow-md hover:bg-green-800 transition"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs md:text-sm text-gray-500">
              or continue with
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google button */}
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-[0.98rem] md:text-[1rem] font-medium text-gray-800 shadow-sm hover:bg-gray-100 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="h-5 w-5"
            />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>

      {/* RIGHT – scholar quotes panel */}
      <ScholarQuotesPanel />
    </section>
  );

  return useAnimation ? <AnimatedPage>{content}</AnimatedPage> : content;
};

export default Login;
