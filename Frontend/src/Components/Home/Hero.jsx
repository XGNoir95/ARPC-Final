import { useEffect, useRef, useState } from "react";
import { publicAsset } from "../../utils/publicAsset";

// Replace these existing photos with club photography whenever it is available.
const heroPhotos = [
  { label: "01", name: "AUST campus", image: "/heroBanner.jpg" },
  { label: "02", name: "Community", image: "/images/about/community.jpg" },
  { label: "03", name: "Learning", image: "/images/about/learning.jpg" },
];

// Each photo remains visible for six seconds after an automatic or manual change.
const PHOTO_INTERVAL_MS = 6000;

function useMediaPreference(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia?.(query).matches ?? false,
  );
  useEffect(() => {
    const media = window.matchMedia?.(query);
    const handleChange = (event) => setMatches(event.matches);
    media?.addEventListener?.("change", handleChange);
    return () => media?.removeEventListener?.("change", handleChange);
  }, [query]);
  return matches;
}

const Hero = () => {
  const [activePhoto, setActivePhoto] = useState(0);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [controlsHovered, setControlsHovered] = useState(false);
  const [controlsFocused, setControlsFocused] = useState(false);
  const [pageHidden, setPageHidden] = useState(() => document.hidden);
  const reducedMotion = useMediaPreference("(prefers-reduced-motion: reduce)");
  const verticalRail = useMediaPreference("(min-width: 1024px)");
  const photoButtons = useRef([]);
  const draggingTrack = useRef(false);

  useEffect(() => {
    const handleVisibility = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (
      controlsHovered ||
      controlsFocused ||
      reducedMotion ||
      pageHidden
    )
      return;
    const timer = window.setTimeout(() => {
      setActivePhoto((current) => (current + 1) % heroPhotos.length);
    }, PHOTO_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [
    activePhoto,
    selectionVersion,
    controlsHovered,
    controlsFocused,
    reducedMotion,
    pageHidden,
  ]);

  const selectPhoto = (index) => {
    setActivePhoto(index);
    setSelectionVersion((current) => current + 1);
  };

  const handlePhotoKeys = (event, focusButton = true) => {
    const nextPhoto = {
      ArrowDown: (activePhoto + 1) % heroPhotos.length,
      ArrowUp: (activePhoto - 1 + heroPhotos.length) % heroPhotos.length,
      ArrowRight: (activePhoto + 1) % heroPhotos.length,
      ArrowLeft: (activePhoto - 1 + heroPhotos.length) % heroPhotos.length,
      Home: 0,
      End: heroPhotos.length - 1,
    }[event.key];
    if (nextPhoto === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    selectPhoto(nextPhoto);
    if (focusButton) photoButtons.current[nextPhoto]?.focus();
  };

  const selectPhotoAtPointer = (event) => {
    const { top, height, left, width } =
      event.currentTarget.getBoundingClientRect();
    const length = verticalRail ? height : width;
    if (!length) return;
    const offset = verticalRail ? event.clientY - top : event.clientX - left;
    const photo = Math.floor((offset / length) * heroPhotos.length);
    selectPhoto(Math.max(0, Math.min(heroPhotos.length - 1, photo)));
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#0b1d26] text-white lg:min-h-[min(60rem,100svh)]"
    >
      {/* Preload the photo layers so selecting a photo does not mount a new image. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-30 overflow-hidden"
      >
        {heroPhotos.map((photo, index) => (
          <img
            key={photo.image}
            src={publicAsset(photo.image)}
            alt=""
            fetchPriority={index === 0 ? "high" : "low"}
            decoding="async"
            data-active={activePhoto === index}
            className={`absolute inset-0 size-full object-cover object-[58%_center] transition-opacity duration-1000 ease-in-out motion-reduce:transition-none lg:object-center ${activePhoto === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-linear-to-br from-[#0b1d26]/90 via-[#0b1d26]/55 to-[#0b1d26]/20"
      />

      <div className="relative flex flex-1 flex-col justify-center px-6 pt-36 pb-28 sm:pt-40 sm:pb-36 lg:mx-20 lg:pt-48 lg:pb-48 2xl:px-24">
        <div className="grid flex-1 grid-rows-[1fr_auto] items-center gap-12 lg:flex-initial lg:grid-cols-[minmax(0,1fr)_5rem] lg:grid-rows-1 lg:gap-16">
          <div className="mx-auto w-full min-w-0 max-w-3xl text-center lg:mx-0 lg:max-w-[59.375rem] lg:text-left">
            <p className="mb-6 flex items-center justify-center gap-3 text-[0.65rem] leading-relaxed font-semibold tracking-[0.18em] text-[#E9AD5E] uppercase sm:gap-6 sm:text-xs lg:mb-8 lg:justify-start lg:text-lg lg:tracking-[0.3em]">
              <span
                aria-hidden="true"
                className="h-px w-10 shrink-0 bg-current sm:w-16 lg:w-[4.5rem]"
              />
              Ahsanullah Roh. Peace Club
            </p>

            <h1
              id="hero-heading"
              className="mx-auto max-w-[16em] font-garamond text-[clamp(2.3rem,6.4vw,5rem)] leading-[1.08] font-medium tracking-[-0.02em] text-balance lg:mx-0"
            >
              Find Where You Belong.
              <br />
              Discover Who You’ll Become.
            </h1>

            <p
              lang="ar"
              dir="rtl"
              className="mx-auto mt-6 w-fit max-w-full font-serif text-[clamp(1.2rem,3vw,3rem)] leading-relaxed text-[#E9AD5E] sm:mt-8 lg:mx-0"
            >
              السلامُ عليكم ورحمةُ اللهِ وبركاتُهُ
            </p>
            <p className="mx-auto mt-4 max-w-[30rem] text-base leading-relaxed text-white/85 sm:text-lg lg:mx-0 lg:text-[1.3rem]">
              Faith, friendship, and service — a place to grow together at AUST.
            </p>

            <div className="mt-8 sm:mt-10">
              <button
                type="button"
                onClick={scrollToAbout}
                className="group inline-flex min-h-14 cursor-pointer items-center gap-5 rounded-full border border-white/15 bg-green-700 py-2.5 pr-3 pl-6 text-base font-semibold text-white shadow-lg shadow-black/15 transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9AD5E] active:bg-green-900 motion-reduce:transition-none sm:gap-6 sm:pl-7 sm:text-lg"
              >
                Discover ARPC
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10"
                >
                  <img
                    src={publicAsset("/images/hero/scroll-down.svg")}
                    alt=""
                    width="16"
                    height="24"
                    className="h-5 w-3.5 -rotate-90 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </span>
              </button>
            </div>
          </div>
          <div
            role="group"
            aria-label="Hero photos"
            className="relative z-20 w-fit justify-self-center lg:justify-self-end"
          >
            <div
              onKeyDown={handlePhotoKeys}
              onMouseEnter={() => setControlsHovered(true)}
              onMouseLeave={() => setControlsHovered(false)}
              onFocusCapture={() => setControlsFocused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setControlsFocused(false);
              }}
              className="relative flex w-48 pt-4 lg:w-20 lg:flex-col lg:pt-0"
            >
              {heroPhotos.map((photo, index) => (
                <button
                  key={photo.label}
                  ref={(element) => {
                    photoButtons.current[index] = element;
                  }}
                  type="button"
                  aria-label={`${photo.label}: ${photo.name}`}
                  aria-pressed={activePhoto === index}
                  onClick={() => selectPhoto(index)}
                  className={`flex h-11 w-1/3 cursor-pointer items-center justify-center text-sm font-semibold transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-15 lg:w-full lg:justify-end lg:pr-8 lg:text-lg ${activePhoto === index ? "text-white" : "text-white/60"}`}
                >
                  {photo.label}
                </button>
              ))}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Choose hero photo"
                aria-orientation={verticalRail ? "vertical" : "horizontal"}
                aria-valuemin={0}
                aria-valuemax={heroPhotos.length - 1}
                aria-valuenow={activePhoto}
                aria-valuetext={heroPhotos[activePhoto].name}
                onKeyDown={(event) => handlePhotoKeys(event, false)}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  draggingTrack.current = true;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  event.currentTarget.focus();
                  selectPhotoAtPointer(event);
                }}
                onPointerMove={(event) => {
                  if (draggingTrack.current) selectPhotoAtPointer(event);
                }}
                onPointerUp={() => {
                  draggingTrack.current = false;
                }}
                onPointerCancel={() => {
                  draggingTrack.current = false;
                }}
                onLostPointerCapture={() => {
                  draggingTrack.current = false;
                }}
                className="absolute inset-x-0 top-0 h-4 cursor-ew-resize touch-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:inset-x-auto lg:inset-y-0 lg:right-0 lg:h-auto lg:w-6 lg:cursor-ns-resize"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] bg-white/35 lg:inset-x-auto lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[3px]"
                >
                  <span
                    className="absolute top-0 left-0 h-full w-1/3 bg-white transition-transform duration-500 ease-in-out motion-reduce:transition-none lg:h-1/3 lg:w-full"
                    style={{
                      transform: `translate${verticalRail ? "Y" : "X"}(${activePhoto * 100}%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p
        aria-live={controlsFocused ? "polite" : "off"}
        aria-atomic="true"
        className="sr-only"
      >
        Photo {activePhoto + 1} of {heroPhotos.length}:{" "}
        {heroPhotos[activePhoto].name}
      </p>

      {/* Finish in the existing next section's white, without changing that section. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px -z-10 h-28 bg-linear-to-b from-transparent via-white/55 via-65% to-white sm:h-36 lg:h-44"
      />
    </section>
  );
};

export default Hero;
