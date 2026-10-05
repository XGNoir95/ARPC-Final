// src/Components/AnimatedPage.jsx
import React from "react";
import { motion as Motion } from "framer-motion";

const AnimatedPage = ({ children, className = "" }) => {
  return (
    <Motion.div
      className={className}
      initial={{ opacity: 0, x: 60 }}          // start slightly to the right
      animate={{ opacity: 1, x: 0 }}          // slide into place
      exit={{ opacity: 0, x: -60 }}           // slide out to the left
      transition={{
        duration: 0.45,
        ease: [0.22, 0.61, 0.36, 1],          // smooth “material-like” easing
      }}
    >
      {children}
    </Motion.div>
  );
};

export default AnimatedPage;
