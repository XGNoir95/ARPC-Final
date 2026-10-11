// src/Components/ScrollToTopButton.jsx
import React, { useState, useEffect } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Disable browser's automatic scroll restoration (so Back button doesn't restore old position)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";

      // optional: restore previous behavior on unmount
      return () => {
        window.history.scrollRestoration = prev;
      };
    }
  }, []);

  // Show/hide button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "instant" : "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="
        fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50
        rounded-full bg-gradient-to-b from-green-900 to-green-700
        shadow-lg p-3 md:p-4 flex items-center justify-center
        text-white
        transform transition-transform duration-200
        hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none
      "
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 md:w-7 md:h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
