// src/components/Hero.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    // No flags needed; slide will only play when coming from /login or /register
    navigate("/register");
  };

  return (
    <section
      className="
        relative w-full md:h-[85vh] h-[75vh] overflow-hidden
        bg-[url('/arpcBanner.png')] bg-cover bg-center
      "
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block animate-[heroSlideUp_1.2s_ease-out_forwards] transform-gpu">
            {/* Arabic line */}
            <p className="text-4xl md:text-5xl lg:text-[4.2rem] font-garamond font-semibold text-yellow-500 mb-4 md:mb-10">
              السلامُ عليكم ورحمةُ اللهِ وبركاتُهُ
            </p>

            {/* English dua line */}
            <p className="text-2xl md:text-3xl lg:text-3xl font-semibold text-white mb-4 md:mb-6">
              May the peace, mercy, and blessings of Allah
              <br />
              be with you
            </p>

            {/* Welcome label */}
            <p className="text-lg md:text-2xl lg:text-2xl tracking-[0.2em] text-white mb-4">
              WELCOME TO
            </p>

            {/* Club name */}
            <h1 className="text-3xl md:text-4xl lg:text-[3.2rem] font-garamond font-bold text-yellow-500 mb-6 md:mb-10">
              Ahsanullah Roh. Peace Club - ARPC
            </h1>

            {/* Button */}
            <button
              onClick={handleJoinClick}
              className="px-10 py-3 text-xl lg:text-2xl rounded-full bg-green-700 text-white font-semibold shadow-lg hover:bg-green-800 transition"
            >
              Join us today!
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
