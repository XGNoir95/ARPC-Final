import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicAsset } from "../utils/publicAsset";

const links = [{ label: "Home", route: "/" }, { label: "Catalogue", route: "/catalogue" }, { label: "Panel", route: "/team" }];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E]";
const joinStyle = `inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-current px-5 py-2 font-garamond text-xl leading-none font-semibold transition-colors hover:border-[#E9AD5E] hover:bg-[#E9AD5E] hover:text-[#173d2e] motion-reduce:transition-none ${focus}`;

export default function Navbar({ blendWithHero = false, loading = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleNavigate = (route) => {
    navigate(route);
    setIsMenuOpen(false);
  };

  return (
    <nav aria-label="Main navigation" className={`relative z-50 text-white transition-colors duration-200 ease-out motion-reduce:transition-none [&_img[alt=Logo]]:transition-[filter] [&_img[alt=Logo]]:duration-200 motion-reduce:[&_img[alt=Logo]]:transition-none ${loading && blendWithHero ? "route-nav-loading text-[#173d2e]! bg-[#eef4ef]! transition-none! [&_img[alt=Logo]]:[filter:brightness(0)_saturate(100%)_invert(22%)_sepia(25%)_saturate(878%)_hue-rotate(98deg)_brightness(85%)_contrast(96%)] [&_img[alt=Logo]]:transition-none!" : ""} ${blendWithHero ? "bg-transparent" : "bg-[#173d2e]"}`}>
      <div className={`mx-auto flex max-w-[112rem] items-center justify-between gap-4 px-6 lg:mx-20 2xl:px-24 ${blendWithHero ? "py-6 lg:py-8" : "py-4"}`}>
        <button type="button" onClick={() => handleNavigate("/")} aria-label="ARPC home" className={`relative flex h-16 w-[min(21rem,calc(100%_-_4rem))] shrink-0 cursor-pointer items-center overflow-hidden md:w-60 lg:h-20 lg:w-[24rem] xl:w-[32rem] ${focus}`}>
          <img src={publicAsset("/logo1.png")} alt="Logo" className="absolute top-1/2 left-1/2 h-auto w-[122%] max-w-none -translate-x-1/2 -translate-y-1/2" />
        </button>

        <div className="hidden items-center gap-5 font-garamond text-2xl font-semibold md:flex lg:gap-8">
          {links.map(({ label, route }) => <button key={route} type="button" onClick={() => handleNavigate(route)} className={`min-h-11 cursor-pointer hover:underline ${focus}`}>{label}</button>)}
          <button type="button" onClick={() => handleNavigate("/join")} className={joinStyle}>Join Us</button>
        </div>

        <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-controls="mobile-navigation" className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded md:hidden ${focus}`}>
          <span className="sr-only">Toggle menu</span>
          <svg aria-hidden="true" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={isMenuOpen ? "M6 18 18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {isMenuOpen && <div id="mobile-navigation" className={`space-y-2 px-5 pt-4 pb-5 font-garamond text-2xl font-semibold text-white md:hidden ${blendWithHero ? "absolute inset-x-6 top-24 rounded-xl bg-[#173d2e]/95 backdrop-blur-md sm:inset-x-10" : "border-t border-white/15 bg-[#173d2e]"}`}>
        {links.map(({ label, route }) => <button key={route} type="button" onClick={() => handleNavigate(route)} className={`block min-h-11 w-full cursor-pointer py-1 text-left hover:underline ${focus}`}>{label}</button>)}
        <button type="button" onClick={() => handleNavigate("/join")} className={`${joinStyle} mt-3 w-full`}>Join Us</button>
      </div>}
    </nav>
  );
}
