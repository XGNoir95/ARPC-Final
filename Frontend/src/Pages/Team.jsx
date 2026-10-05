// src/Pages/Team.jsx
import React, { useState, useEffect } from "react";
import { FaFacebookF, FaLinkedinIn, FaGithub } from "react-icons/fa";

const teams = [
  {
    id: "executive",
    label: "Executive Panel",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi utaliquip ex ea commodo consequat. ",
  },
  {
    id: "dawah",
    label: "Dawah Team",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi utaliquip ex ea commodo consequat. ",
  },
  {
    id: "social-media",
    label: "Social Media & Content Writing Team",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi utaliquip ex ea commodo consequat. ",
  },
  {
    id: "graphics",
    label: "Graphics Team",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi utaliquip ex ea commodo consequat. ",
  },
  {
    id: "logistics",
    label: "Logistics & Event Management Team",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi utaliquip ex ea commodo consequat. ",
  },
  {
    id: "web-dev",
    label: "Web Development Team",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi utaliquip ex ea commodo consequat. ",
  },
];

// Sample member reused
const sampleMember = {
  name: "Sample Member",
  department: "Department of Computer Science & Engineering",
  image:
    "https://pbs.twimg.com/profile_images/1328353245408993280/xooFrrYm_400x400.jpg",
  facebook: "#",
  linkedin: "#",
  github: "#",
};

// Simple left-to-right typing animation
const TypingTextAnimation = ({ text, speed }) => {
  const [displayed, setDisplayed] = useState("");
  const done = displayed.length === text.length;

  useEffect(() => {
    let index = 0;

    const intervalId = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <span className="inline-flex items-center">
      <span>{displayed}</span>
      {!done && (
        <span className="inline-block w-[2px] h-[1.1em] bg-green-800 ml-1 animate-pulse" />
      )}
    </span>
  );
};

const TypingText = ({ text, speed = 90 }) => (
  <TypingTextAnimation key={`${text}:${speed}`} text={text} speed={speed} />
);

/* ---------------- EXECUTIVE COMMITTEE DATA ---------------- */

const committeeMembers = [
  {
    id: "president",
    name: "Sample Member",
    role: "President",
    department: "Department of Computer Science & Engineering",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: "vp",
    name: "Sample Member",
    role: "Vice President",
    department: "Department of Electrical & Electronic Engineering",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: "general-secretary",
    name: "Sample Member",
    role: "General Secretary",
    department: "Department of Civil Engineering",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: "joint-secretary",
    name: "Sample Member",
    role: "Joint Secretary",
    department: "Department of Mechanical Engineering",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

/* ------------ EXECUTIVE COMMITTEE ROW (WITH SLIDE ANIMATION) ------------ */

const CommitteeRow = ({ member, index }) => {
  const isImageLeft = index % 2 === 0; // 0,2: image left & slide R→L; 1,3: image right & slide L→R
  const [visible, setVisible] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Slide-in visibility
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Detect lg+ screens for clamping
  useEffect(() => {
    const updateSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // Tailwind lg breakpoint
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className={`flex flex-col lg:flex-row ${
        isImageLeft ? "" : "lg:flex-row-reverse"
      } items-center lg:items-start gap-10 mb-16 transform transition-all duration-1500 ease-out
      ${
        visible
          ? "opacity-100 translate-x-0"
          : isImageLeft
          ? "opacity-0 translate-x-16" // slide in from right
          : "opacity-0 -translate-x-16" // slide in from left
      }`}
    >
      {/* Image block — centered on sm, aligned on lg */}
      <div className="shrink-0 mx-auto lg:mx-0">
        <img
          src={sampleMember.image}
          alt={member.role}
          className="lg:w-[400px] lg:h-[400px] w-[325px] h-[325px] rounded-2xl object-cover"
        />
      </div>

      {/* Text block — centered on sm, left on lg */}
      <div className="flex-1 text-center lg:text-left space-y-2 mt-4 lg:mt-0">
        <h3 className="text-[1.85rem] md:text-[2.7rem] font-garamond font-bold text-green-800">
          {member.name}
        </h3>
        <p className="text-[1.7rem] md:text-[1.9rem] font-garamond font-semibold text-green-900">
          {member.role}
        </p>
        <p className="text-[1.55rem] md:text-[1.6rem] font-garamond text-green-900 text-justify lg:text-left">
          {member.department}
        </p>

        {/* Description:
            - base/sm: HIDDEN
            - md: full text, no clamp
            - lg+: clamped to 4 lines
        */}
        <p
          className={`hidden sm:block text-[1.4rem] md:text-[1.55rem] font-garamond text-gray-700 text-justify lg:text-justify ${
            isLargeScreen ? "line-clamp-4" : ""
          }`}
        >
          {member.description}
        </p>

        <div className="mt-4 flex items-center justify-center lg:justify-start gap-3 text-gray-500">
          <a
            href={sampleMember.facebook}
            className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors"
          >
            <FaFacebookF className="text-[1.1rem]" />
          </a>
          <a
            href={sampleMember.linkedin}
            className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors"
          >
            <FaLinkedinIn className="text-[1.1rem]" />
          </a>
          <a
            href={sampleMember.github}
            className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors"
          >
            <FaGithub className="text-[1.1rem]" />
          </a>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN PAGE ---------------- */

const TeamPage = () => {
  return (
    <section className="bg-[#f9fafb] py-12 md:py-16 lg:py-14">
      {/* Only this container is adjusted for sm/md; lg layout stays the same */}
      <div className="max-w-8xl lg:mx-20 px-6 2xl:px-24">
        {/* Top header */}
        <div className="mb-10 md:mb-14">
          <h2 className="text-[2.6rem] md:text-[3.6rem] font-garamond font-bold bg-gradient-to-r from-[#133729] to-green-500 bg-clip-text text-transparent mb-2">
            <span className="bg-gradient-to-r from-[#133729] to-green-700 bg-clip-text text-transparent inline-block mb-5">
              <TypingText text="Meet the people behind ARPC" speed={95} />
            </span>
          </h2>
          <p className="text-[1.6rem] md:text-[1.8rem] leading-relaxed font-garamond text-gray-500 text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>

        {/* EXECUTIVE COMMITTEE */}
        <section className="mb-14 md:mb-16 lg:mb-20">
          <h2 className="text-[2rem] md:text-[2.7rem] font-garamond font-bold mb-2">
            <span className="bg-gradient-to-r from-[#133729] to-green-700 bg-clip-text text-transparent inline-block mb-5">
              <TypingText text="Executive Committee" speed={90} />
            </span>
          </h2>
          <div className="space-y-10 md:space-y-12">
            {committeeMembers.map((member, index) => (
              <CommitteeRow key={member.id} member={member} index={index} />
            ))}
          </div>
        </section>

        {/* TEAM PANELS */}
        <div className="space-y-12 md:space-y-14 lg:space-y-16">
          {teams.map((team) => (
            <section key={team.id}>
              {/* Panel header */}
              <div className="mb-6 md:mb-7">
                <h2 className="text-[2rem] md:text-[2.7rem] font-garamond font-bold sm:mb-2">
                  <span className="bg-gradient-to-r from-[#133729] to-green-700 bg-clip-text text-transparent inline-block">
                    <TypingText text={team.label} speed={90} />
                  </span>
                </h2>
                <p className="mt-3 text-[1.5rem] md:text-[1.7rem] leading-relaxed font-garamond text-gray-500 text-justify">
                  {team.description}
                </p>
              </div>

              {/* Members grid – centered rows */}
              <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <article
                    key={`${team.id}-member-${idx}`}
                    className="w-full sm:w-auto mx-auto"
                  >
                    {/* Fixed-size image: 400x400 */}
                    <div className="lg:w-[400px] lg:h-[400px] w-[325px] h-[325px] mx-auto lg:mx-2">
                      <img
                        src={sampleMember.image}
                        alt={sampleMember.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>

                    {/* Text area – centered on sm/md, left on lg+ */}
                    <div className="mt-5 max-w-[325px] mx-auto text-center">
                      <h3 className="text-[1.85rem] md:text-[1.9rem] font-semibold text-green-800 font-garamond">
                        {sampleMember.name}
                      </h3>
                      <p className="mt-[1.55] text-[1.35rem] text-gray-500 font-garamond">
                        {sampleMember.department}
                      </p>

                      {/* Social icons */}
                      <div className="mt-3 flex items-center justify-center gap-3 text-gray-500">
                        <a
                          href={sampleMember.facebook}
                          className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors"
                        >
                          <FaFacebookF className="text-[1.1rem]" />
                        </a>
                        <a
                          href={sampleMember.linkedin}
                          className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors"
                        >
                          <FaLinkedinIn className="text-[1.1rem]" />
                        </a>
                        <a
                          href={sampleMember.github}
                          className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors"
                        >
                          <FaGithub className="text-[1.1rem]" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamPage;
