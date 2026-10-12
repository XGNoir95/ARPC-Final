// src/Pages/Register.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ScholarQuotesPanel from "../Components/ScholarQuotesPanel";
import { publicAsset } from "../utils/publicAsset";

const Register = () => {
  const navigate = useNavigate();
  const content = (
    <section
      className="relative min-h-screen bg-white flex flex-col lg:flex-row justify-center lg:justify-start"
    >
      {/* Top-left back button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Back to home"
        className="absolute top-4 left-4 md:top-6 md:left-6
                   inline-flex min-h-11 min-w-11 items-center justify-center gap-2
                   rounded-full bg-white/90 text-green-800
                   px-3 py-1.5 md:px-3 md:py-1.5
                   text-xs md:text-sm font-medium
                   shadow-xl hover:bg-gray-100 transition"
      >
        <span className="text-3xl md:text-3xl font-bold pb-1">←</span>
      </button>

      {/* LEFT – Scholar panel */}
      <ScholarQuotesPanel />

      {/* RIGHT – form column */}
      <div className="w-full lg:w-3/5 flex flex-col items-center lg:justify-center justify-start lg:py-0 sm:py-12">
        <div
          className="
            max-w-4xl
            lg:max-w-5xl
            w-full mx-auto
            px-6 sm:px-10
            lg:px-10 xl:px-20
            pt-18 pb-10 lg:py-12
          "
        >
          {/* Logo + name */}
          <div className="flex items-center lg:gap-4 gap-2 mb-6">
            <img
              src={publicAsset("/logo.jpg")}
              alt="ARPC Logo"
              className="size-20 shrink-0 rounded-full object-contain sm:size-36"
            />
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <p className="text-sm tracking-[0.25em] uppercase text-green-700 font-semibold">
                ARPC
              </p>
              <p className="mt-1 text-[1.5rem] sm:text-[1.8rem] lg:text-[2rem] font-garamond font-semibold text-green-800">
                Ahsanullah Roh. Peace Club
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[1.9rem] md:text-[2.4rem] font-garamond font-bold text-green-800 mb-2">
              Create your ARPC account
            </h1>
            <p className="text-[1rem] md:text-lg text-gray-600">
              Already have an account?{" "}
              <button
                className="text-green-800 font-semibold hover:underline"
                type="button"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                  placeholder="+8801XXXXXXXXX"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
                >
                  AUST email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                  placeholder="you.rid@aust.edu"
                />
              </div>

              <div>
                <label
                  htmlFor="studentId"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
                >
                  Student ID
                </label>
                <input
                  id="studentId"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                  placeholder="e.g. 20XX010XXX"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="department"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
                >
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                  placeholder="CSE / EEE / CE / ..."
                />
              </div>

              <div>
                <label
                  htmlFor="batch"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
                >
                  Batch / Year
                </label>
                <input
                  id="batch"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                  placeholder="e.g. 22.1.1"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                  placeholder="Create a strong password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[1.08rem] md:text-lg font-medium text-gray-600 mb-1"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                  placeholder="Re-enter your password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-3 text-[0.97rem] md:text-[1.2rem] font-semibold text-white shadow-md hover:bg-green-800 transition"
            >
              Create account
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
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-[0.97rem] md:text-[1.1rem] font-medium text-gray-800 shadow-sm hover:bg-gray-100 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="h-5 w-5"
            />
            <span>Sign up with Google</span>
          </button>
        </div>
      </div>
    </section>
  );

  return content;
};

export default Register;
