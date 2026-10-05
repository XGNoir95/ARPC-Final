// src/components/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { publicAsset } from "../utils/publicAsset";

const Footer = () => {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    // No flags; global logic decides if slide plays
    navigate("/register");
  };

  return (
    <footer className="bg-gradient-to-r from-[#0E291E] via-[#133729] to-green-700 text-white">
      {/* Main footer content */}
      <div className="max-w-8xl lg:mx-20 px-6 2xl:px-24 py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
          {/* LEFT: Logo + club texts (single column) */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {/* Logo row – visually centered over the text block */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <img
                src={publicAsset("/newLogo.png")}
                alt="Ahsanullah Roh. Peace Club Logo"
                className="h-60 lg:h-60 w-auto"
              />
            </div>

            {/* Club name + campus */}
            <div className="mb-3">
              <h3 className="text-[1.9rem] md:text-[2.35rem] font-garamond font-bold text-yellow-500">
                Ahsanullah Roh. Peace Club
              </h3>
              <p className="text-[1.3rem] md:text-[1.45rem] font-garamond mt-1 text-white">
                AUST Campus
              </p>
            </div>

            {/* Description */}
            <p className="text-[1.29rem] md:text-[1.38rem] font-garamond leading-relaxed text-gray-100 text-justify mt-1">
              A student-run club dedicated to cultivating peace, service, and
              sincere connection with the Creator and creation through regular
              events, study circles, and community projects.
            </p>

            {/* Join us button */}
            <div className="mt-6">
              <button
                onClick={handleJoinClick}
                className="inline-flex items-center px-12 py-2 rounded-full hover:border border-white/60 bg-green-800 font-semibold hover:bg-green-900 transition text-[1rem] md:text-[1.2rem]"
              >
                Join us
              </button>
            </div>
          </div>

          {/* RIGHT: Map + contact & links */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {/* Map – AUST campus with red marker */}
            <div className="w-full mb-6 rounded-xl overflow-hidden shadow-lg border border-green-700/60">
              <iframe
                title="AUST Campus Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.5395156655372!2d90.4042055111543!3d23.76379498817254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c790e6cf50a9%3A0xcae56c17297f85f8!2sAhsanullah%20University%20of%20Science%20and%20Technology!5e0!3m2!1sen!2sbd!4v1763760213679!5m2!1sen!2sbd"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Contact section */}
            <div>
              <h4 className="text-[1.75rem] md:text-[2.1rem] font-garamond font-bold mb-4">
                Contact &amp; Links
              </h4>

              <div className="space-y-2 text-[1.29rem] md:text-[1.5rem] font-garamond">
                <p>
                  <span className="font-semibold text-yellow-500">Email:</span>{" "}
                  <a href="mailto:info@arpc.club" className="hover:underline">
                    info@arpc.club
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-yellow-500">Address:</span>{" "}
                  AUST Campus, Tejgaon, Dhaka
                </p>
              </div>

              {/* Social icons inside contact section */}
              <div className="mt-6">
                <p className="font-garamond text-[1.5rem] mb-4">
                  Connect with us:
                </p>
                <div className="flex items-center gap-5">
                  {/* Facebook */}
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center shadow-md hover:bg-white hover:text-green-800 transition transform hover:-translate-y-0.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 md:w-7 md:h-7"
                      fill="currentColor"
                    >
                      <path d="M13.5 22v-7h2.3l.4-3h-2.7v-1.9c0-.9.3-1.5 1.6-1.5H16V5.1C15.7 5 14.8 5 13.8 5c-2.6 0-4.3 1.6-4.3 4.4V12H7.5v3h2v7h4z" />
                    </svg>
                  </a>

                  {/* Gmail (email) */}
                  <a
                    href="mailto:info@arpc.club"
                    aria-label="Email"
                    className="w-12 h-12  rounded-full bg-green-700 flex items-center justify-center shadow-md hover:bg-white hover:text-green-800 transition transform hover:-translate-y-0.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 md:w-7 md:h-7"
                      fill="currentColor"
                    >
                      <path d="M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 2v.2l-8 5-8-5V7h16zm0 10H4V9.5l8 5 8-5V17z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="#"
                    aria-label="YouTube"
                    className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center shadow-md hover:bg-white hover:text-green-800 transition transform hover:-translate-y-0.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 md:w-7 md:h-7"
                      fill="currentColor"
                    >
                      <path d="M21.6 8.2a2.5 2.5 0 0 0-1.8-1.8C18.1 6 12 6 12 6s-6.1 0-7.8.4A2.5 2.5 0 0 0 2.4 8.2 26.4 26.4 0 0 0 2 12a26.4 26.4 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.8 1.8C5.9 18 12 18 12 18s6.1 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26.4 26.4 0 0 0 22 12a26.4 26.4 0 0 0-.4-3.8zM10 15v-6l5 3-5 3z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom partition + copyright row */}
        <div className="mt-8 pt-4 border-t border-green-700 flex flex-col md:flex-row items-center justify-between gap-2 text-lg md:text-[1.2rem] text-green-100/80 font-garamond">
          <p>© 2025 Ahsanullah Roh. Peace Club. All rights reserved.</p>
          <p>
            Designed for{" "}
            <span className="font-semibold">
              students, seekers &amp; community.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
