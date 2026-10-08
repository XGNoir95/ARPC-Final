import { useState } from "react";
import { Link } from "react-router-dom";
import Quote from "./Home/Quote";
import { publicAsset } from "../utils/publicAsset";

const campusMapLink =
  "https://www.google.com/maps/dir/?api=1&destination=Ahsanullah+University+of+Science+and+Technology";
const focusStyle =
  "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E]";
const linkStyle = `inline-flex min-h-11 items-center text-white/80 transition-colors hover:text-[#E9AD5E] motion-reduce:transition-none ${focusStyle}`;

const Footer = ({ includeQuote = false }) => {
  const [reflectionOpen, setReflectionOpen] = useState(false);

  return (
  <footer className="bg-[#0e291e] text-white">
    <div>
      <div
        className={
          includeQuote
            ? "grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
            : ""
        }
      >
        {includeQuote && <Quote onReflectionToggle={setReflectionOpen} />}

        {/* The open reflection sets the desktop row height; this panel fills it. */}
        <div
          className={`@container flex min-w-0 flex-col bg-[#0e291e] px-6 py-12 sm:py-14 lg:py-16 ${includeQuote ? "lg:pr-26 lg:pl-12 2xl:pr-44 2xl:pl-16" : "lg:px-26 2xl:px-44"} ${includeQuote && reflectionOpen ? "lg:min-h-0 lg:[contain:size]" : ""}`}
        >
          <Link
            to="/"
            className={`flex w-fit max-w-full items-center gap-4 ${focusStyle}`}
          >
            <img
              src={publicAsset("/newLogo.png")}
              alt=""
              width="80"
              height="80"
              loading="lazy"
              decoding="async"
              className="size-18 shrink-0 object-contain sm:size-32"
            />
            <span className="min-w-0">
              <span className="block font-garamond text-5xl leading-none font-semibold tracking-[-0.04em] sm:text-6xl">
                ARPC
              </span>
              <span className="mt-2 block text-xs leading-relaxed text-white/75 sm:text-[1.1rem]">
                Ahsanullah Roh. Peace Club
              </span>
            </span>
          </Link>

          <p className="mt-6 w-full font-garamond text-2xl leading-[1.35] text-balance text-white/85 sm:text-[clamp(1.5rem,6cqi,2.25rem)] lg:text-[clamp(1.25rem,6cqi,2.25rem)]">
            A place at AUST to find your people, share your ideas and make a
            difference together.
          </p>

          <nav
            aria-label="Footer navigation"
            className="my-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-white/15 py-4"
          >
            <ul className="grid w-full grid-cols-3 gap-x-5 gap-y-1 text-sm @min-[26rem]:flex @min-[26rem]:w-auto @min-[26rem]:flex-wrap sm:text-base">
              <li>
                <Link to="/" className={linkStyle}>
                  Home
                </Link>
              </li>
              <li>
                <a href="#" className={linkStyle}>
                  Catalogue
                </a>
              </li>
              <li>
                <Link to="/team" className={linkStyle}>
                  Panel
                </Link>
              </li>
              <li>
                <Link to="/profile" state={{ fromNavbar: true }} className={linkStyle}>
                  Profile
                </Link>
              </li>
              <li><Link to="/login" state={{ fromNavbar: true }} className={linkStyle}>Login</Link></li>
              <li><Link to="/register" state={{ fromNavbar: true }} className={linkStyle}>Register</Link></li>
            </ul>
            <a
              href={campusMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`group inline-flex min-h-12 items-center gap-3 rounded-full border border-white/25 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:border-[#eef4ef] hover:bg-[#eef4ef] hover:text-[#0e291e] motion-reduce:transition-none ${focusStyle}`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0">
                <path d="m21 3-6 18-4-8-8-4 18-6Z" />
                <path d="m11 13 5-5" />
              </svg>
              Campus directions
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </nav>

          <address className="text-base leading-relaxed not-italic">
            <a
              href="mailto:info@arpc.club"
              className={`${linkStyle} font-garamond text-2xl sm:text-3xl`}
            >
              info@arpc.club
            </a>
            <p className="mt-1 text-sm text-white/70 sm:text-base">
              AUST Campus, Tejgaon, Dhaka
            </p>
          </address>

          {includeQuote && reflectionOpen && (
            <section
              aria-labelledby="reflection-action-heading"
              className="mt-7 flex flex-1 flex-col justify-center border-t border-white/15 pt-6 pb-2 lg:min-h-0"
            >
              <div>
                <h2
                  id="reflection-action-heading"
                  className="font-garamond text-3xl leading-tight font-medium text-balance sm:text-4xl"
                >
                  Put learning into practice.
                </h2>
                <p className="mt-3 w-full text-base leading-relaxed text-white/75 sm:text-lg">
                  Knowledge becomes meaningful when it reaches someone else.
                  Help a friend understand a difficult topic, listen to a
                  classmate, or turn an idea into something useful.
                </p>
                <a
                  href="mailto:info@arpc.club?subject=An%20idea%20for%20ARPC"
                  className={`group mt-4 inline-flex min-h-12 items-center gap-3 border-b border-white/30 py-2 text-base font-medium transition-colors hover:border-[#E9AD5E] hover:text-[#E9AD5E] motion-reduce:transition-none ${focusStyle}`}
                >
                  Share an idea with ARPC
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 6 9 7 9-7" />
                  </svg>
                </a>
              </div>
            </section>
          )}

          <div className="mt-auto pt-7">
            <Link
              to="/register"
              className={`group flex min-h-14 items-center justify-between gap-4 rounded-xl bg-[#eef4ef] px-5 py-3 text-base font-semibold text-[#0e291e] transition-colors hover:bg-[#E9AD5E] motion-reduce:transition-none ${focusStyle}`}
            >
              Join ARPC
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="flex max-w-8xl flex-col gap-4 px-6 pt-6 pb-20 md:flex-row md:items-center md:justify-between md:gap-8 lg:mx-20 lg:pb-6 2xl:px-24">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
            <span className="text-xs text-white/55 sm:text-sm">© {new Date().getFullYear()}</span>
            <span className="font-garamond text-lg leading-none text-[#eef4ef] sm:border-l sm:border-white/20 sm:pl-4 sm:text-xl">
              Ahsanullah Roh. Peace Club
            </span>
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-white/65">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0">
              <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            AUST, Tejgaon, Dhaka
          </p>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
