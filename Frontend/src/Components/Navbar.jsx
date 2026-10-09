// src/Components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicAsset } from "../utils/publicAsset";

const Navbar = ({ blendWithHero = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthAction = (route) => {
    navigate(route, { state: { fromNavbar: true } }); // keep your auth flag
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // Generic navigation for logo, Home, Panel
  const handleNavigate = (route) => {
    navigate(route);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav aria-label="Main navigation" className={`text-white relative z-50 ${blendWithHero ? "bg-transparent" : "bg-gradient-to-r from-[#0E291E] via-[#133729] to-green-700"}`}>
      {/* ==== SMALL & MEDIUM DEVICES ==== */}
      <div className="block lg:hidden">
        <div className={`w-full ${blendWithHero ? "px-6 py-6" : "py-4"}`}>
          <div className="flex items-center justify-between h-16">
            {/* Logo image */}
            <button
              type="button"
              onClick={() => handleNavigate("/")}
              className={blendWithHero ? "relative flex h-16 w-[min(21rem,calc(100%-3rem))] shrink-0 cursor-pointer items-center overflow-hidden sm:w-[24rem] md:w-[20rem]" : "flex items-center cursor-pointer"}
            >
              <img
                src={publicAsset("/logo1.png")}
                alt="Logo"
                className={blendWithHero ? "absolute top-1/2 left-1/2 h-auto w-[122%] max-w-none -translate-x-1/2 -translate-y-1/2" : "h-80 w-auto sm:h-80 md:h-80"}
              />
            </button>

            {/* Desktop links for md only */}
            <div className={`hidden md:flex text-2xl font-garamond font-semibold ${blendWithHero ? "space-x-6" : "space-x-8 mr-8"}`}>
              <button
                type="button"
                onClick={() => handleNavigate("/")}
                className="hover:underline cursor-pointer"
              >
                Home
              </button>
              <a href="#" className="hover:underline cursor-pointer">
                Catalogue
              </a>
              <button
                type="button"
                onClick={() => handleNavigate("/team")}
                className="hover:underline cursor-pointer"
              >
                Panel
              </button>
              <a href="#" className="hover:underline cursor-pointer">
                Profile
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className={blendWithHero ? "md:hidden rounded focus-visible:outline-2 focus-visible:outline-offset-4 cursor-pointer" : "md:hidden pr-5 rounded focus:outline-none cursor-pointer"}
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-expanded={blendWithHero ? isMenuOpen : undefined}
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                className="h-7 w-7"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile links */}
        {isMenuOpen && (
          <div className={`md:hidden px-5 pb-5 space-y-2 text-[1.5rem] font-garamond font-semibold z-50 ${blendWithHero ? "absolute inset-x-6 top-24 rounded-xl bg-[#0b1d26]/95 pt-4 backdrop-blur-md sm:inset-x-10" : "relative bg-gradient-to-r from-[#0E291E] via-[#133729] to-green-700"}`}>
            <button
              type="button"
              onClick={() => handleNavigate("/")}
              className="block py-1 hover:underline text-left w-full cursor-pointer"
            >
              Home
            </button>
            <a href="#" className="block py-1 hover:underline cursor-pointer">
              Catalogue
            </a>
            <button
              type="button"
              onClick={() => handleNavigate("/team")}
              className="block py-1 hover:underline text-left w-full cursor-pointer"
            >
              Panel
            </button>
            <a href="#" className="block py-1 hover:underline cursor-pointer">
              Profile
            </a>

            {/* Mobile Auth Dropdown */}
            <div>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full py-1 hover:underline cursor-pointer"
              >
                <span>Auth</span>
                <svg
                  className={`h-4 w-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="pl-4 mt-1 space-y-1 text-[1.2rem]">
                  <button
                    onClick={() => handleAuthAction("/login")}
                    className="block w-full text-left py-1 hover:underline text-white cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleAuthAction("/register")}
                    className="block w-full text-left py-1 hover:underline text-white cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==== LARGE DEVICES ==== */}
      <div className="hidden lg:block">
        <div className={blendWithHero ? "px-6 py-8 lg:mx-20 2xl:px-24" : "max-w-8xl mx-25 p-4 mr-37"}>
          <div className={`flex items-center justify-between ${blendWithHero ? "h-20" : "h-16"}`}>
            {/* Logo image */}
            <button
              type="button"
              onClick={() => handleNavigate("/")}
              className={blendWithHero ? "relative flex h-20 w-[24rem] cursor-pointer items-center overflow-hidden xl:w-[32rem]" : "flex items-center cursor-pointer"}
            >
              <img src={publicAsset("/logo1.png")} alt="Logo" className={blendWithHero ? "absolute top-1/2 left-1/2 h-auto w-[122%] max-w-none -translate-x-1/2 -translate-y-1/2" : "h-80 w-auto"} />
            </button>

            {/* Desktop links */}
            <div className="flex space-x-8 text-2xl font-garamond font-semibold relative">
              <button
                type="button"
                onClick={() => handleNavigate("/")}
                className="hover:underline cursor-pointer"
              >
                Home
              </button>
              <a href="#" className="hover:underline cursor-pointer">
                Catalogue
              </a>
              <button
                type="button"
                onClick={() => handleNavigate("/team")}
                className="hover:underline cursor-pointer"
              >
                Panel
              </button>

              {/* Desktop Auth Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hover:underline flex items-center cursor-pointer"
                >
                  Auth
                  <svg
                    className={`h-4 w-4 ml-1 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-68 bg-gradient-to-r from-[#133729] to-green-700 rounded-lg shadow-xl py-4 px-2 z-[100] text-[1.3rem]">
                    <button
                      onClick={() => handleAuthAction("/profile")}
                      className="block w-full text-left px-4 py-2 hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleAuthAction("/login")}
                      className="block w-full text-left px-4 py-2 hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleAuthAction("/register")}
                      className="block w-full text-left px-4 py-2 hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside (for desktop) */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40 lg:block hidden cursor-pointer"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
