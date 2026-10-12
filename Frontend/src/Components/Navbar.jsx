import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { publicAsset } from "../utils/publicAsset";

const links = [{ label: "Home", route: "/" }, { label: "Catalogue", route: "/catalogue" }, { label: "Gallery", route: "/gallery" }, { label: "Panel", route: "/team" }];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E]";
const joinStyle = `inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-current px-5 py-2 font-garamond text-xl leading-none font-semibold transition-colors hover:border-[#E9AD5E] hover:bg-[#E9AD5E] hover:text-[#173d2e] motion-reduce:transition-none md:px-4 md:text-lg lg:px-5 lg:text-xl ${focus}`;

export default function Navbar({ blendWithHero = false, loading = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const translucentMenu = blendWithHero && !loading;
  useEffect(() => {
    if (!isMenuOpen) return;
    const dismiss = (event) => {
      if (event.key === "Escape") { setIsMenuOpen(false); toggleRef.current?.focus(); }
    };
    const outside = (event) => { if (!navRef.current?.contains(event.target)) setIsMenuOpen(false); };
    const desktop = window.matchMedia("(min-width: 768px)");
    const resize = () => { if (desktop.matches) setIsMenuOpen(false); };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", resize);
    };
  }, [isMenuOpen]);
  const handleNavigate = (route) => {
    navigate(route);
    setIsMenuOpen(false);
  };

  return (
    <nav ref={navRef} aria-label="Main navigation" className={`relative z-50 text-white transition-colors duration-200 ease-out motion-reduce:transition-none [&_img[alt=Logo]]:transition-[filter] [&_img[alt=Logo]]:duration-200 motion-reduce:[&_img[alt=Logo]]:transition-none ${loading && blendWithHero ? "route-nav-loading text-[#173d2e]! bg-[#eef4ef]! transition-none! [&_img[alt=Logo]]:[filter:brightness(0)_saturate(100%)_invert(22%)_sepia(25%)_saturate(878%)_hue-rotate(98deg)_brightness(85%)_contrast(96%)] [&_img[alt=Logo]]:transition-none!" : ""} ${blendWithHero ? "bg-transparent" : "bg-[#173d2e]"}`}>
      <div className={`mx-auto flex max-w-[112rem] items-center justify-between gap-4 px-6 lg:mx-20 2xl:px-24 ${blendWithHero ? "py-6 lg:py-8" : "py-4"}`}>
        <button type="button" onClick={() => handleNavigate("/")} aria-label="ARPC home" className={`relative flex h-16 w-[min(21rem,calc(100%_-_4rem))] shrink-0 cursor-pointer items-center overflow-hidden md:w-[clamp(17rem,36vw,20rem)] lg:h-20 lg:w-[clamp(15rem,28vw,24rem)] xl:w-[clamp(24rem,32vw,32rem)] ${focus}`}>
          <img src={publicAsset("/logo1.png")} alt="Logo" className="absolute top-1/2 left-1/2 h-auto w-[122%] max-w-none -translate-x-1/2 -translate-y-1/2" />
        </button>

        <div className="hidden shrink-0 items-center gap-4 font-garamond text-xl font-semibold md:flex lg:gap-6 lg:text-2xl xl:gap-8">
          {links.map(({ label, route }) => <button key={route} type="button" onClick={() => handleNavigate(route)} aria-current={pathname === route ? "page" : undefined} className={`min-h-11 cursor-pointer hover:underline ${focus}`}>{label}</button>)}
          <button type="button" onClick={() => handleNavigate("/join")} aria-current={pathname === "/join" ? "page" : undefined} className={joinStyle}>Join Us</button>
        </div>

        <button ref={toggleRef} type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-controls="mobile-navigation" className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/5 transition-colors duration-200 hover:bg-white/15 motion-reduce:transition-none md:hidden ${focus}`}>
          <span className="sr-only">Toggle menu</span>
          <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={isMenuOpen ? "M6 18 18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {isMenuOpen && <div id="mobile-navigation" className={`absolute inset-x-6 top-full mt-1 max-h-[calc(100dvh_-_8rem)] origin-top overflow-y-auto overscroll-contain rounded-2xl border border-white/15 p-3 font-garamond text-xl leading-snug text-[#eef4ef] shadow-[0_20px_48px_-16px_rgba(0,0,0,0.5)] backdrop-blur-xl [animation:nav-menu-enter_240ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none] sm:text-[1.375rem] md:hidden ${translucentMenu ? "bg-black/40" : "bg-[#173d2e]/98"}`}>
        <ul className="divide-y divide-white/10">
          {links.map(({ label, route }) => {
            const current = pathname === route;
            return <li key={route} className="py-1 first:pt-0 last:pb-0">
              <button type="button" onClick={() => handleNavigate(route)} aria-current={current ? "page" : undefined} className={`group flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/5 hover:text-[#E9AD5E] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#E9AD5E] motion-reduce:transition-none ${current ? "bg-white/5 font-semibold text-[#E9AD5E]" : "font-medium text-[#eef4ef]"}`}>
                {label}
                {current ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#E9AD5E]" /> : <svg aria-hidden="true" className="size-4 shrink-0 text-white/40 transition-colors group-hover:text-[#E9AD5E] motion-reduce:transition-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>}
              </button>
            </li>;
          })}
        </ul>
        <button type="button" onClick={() => handleNavigate("/join")} aria-current={pathname === "/join" ? "page" : undefined} className={`group mt-4 flex min-h-13 w-full cursor-pointer items-center justify-between gap-4 rounded-full border py-2 pr-2 pl-5 font-semibold transition-colors duration-200 hover:border-[#E9AD5E] hover:bg-[#E9AD5E] hover:text-[#173d2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9AD5E] motion-reduce:transition-none ${translucentMenu ? "border-white/25 bg-white/10 text-[#eef4ef]" : "border-transparent bg-[#eef4ef] text-[#173d2e]"}`}>
          Join Us
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 group-hover:border-[#173d2e]/30 motion-reduce:transition-none ${translucentMenu ? "border-white/25" : "border-[#173d2e]/20"}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M4 12h16m-6-6 6 6-6 6" /></svg></span>
        </button>
      </div>}
    </nav>
  );
}
