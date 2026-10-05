import { useState } from "react";
import { Link } from "react-router-dom";
import { publicAsset } from "../../utils/publicAsset";

// Replace the placeholder photos here when club photography is available.
const aboutCards = [
  {
    id: "about-us",
    title: "About Us",
    label: "Who we are",
    image: "/images/about/community.jpg",
    summary: "A student community rooted in faith, friendship, and service.",
    description:
      "Ahsanullah Roh. Peace Club brings students at AUST together through faith, friendship, and service. From study circles to community projects, we create opportunities to learn, reflect, and build a sincere connection with the Creator and one another.",
    link: "/team",
    linkLabel: "Meet our team",
  },
  {
    id: "our-mission",
    title: "Our Mission",
    label: "What guides us",
    image: "/images/about/learning.jpg",
    summary: "Turning knowledge into kindness and shared purpose into action.",
    description:
      "Our mission is to turn learning into practice. Through thoughtful discussions, shared study, and acts of service, we encourage students to deepen their understanding of Islam, strengthen their character, and bring compassion into everyday campus life.",
    link: "/register",
    linkLabel: "Be part of our mission",
  },
  {
    id: "our-vision",
    title: "Our Vision",
    label: "Looking ahead",
    image: "/images/about/nature.jpg",
    summary: "A campus shaped by peace, compassion, and a sense of belonging.",
    description:
      "We envision a campus where faith inspires kindness, knowledge leads to service, and every student finds a place to belong. Together, we hope to nurture a community that carries the values of peace and compassion beyond university life.",
    link: "/register",
    linkLabel: "Grow with us",
  },
];

const About = () => {
  const [activeCard, setActiveCard] = useState(0);

  const activateHoveredCard = (event, index) => {
    // Pointer movement also covers a cursor already over a card on page load.
    if (
      (event.pointerType === "mouse" || event.pointerType === "pen") &&
      activeCard !== index
    ) {
      setActiveCard(index);
    }
  };

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mt-3 bg-white py-12 md:py-16"
    >
      <div className="@container/about-layout max-w-8xl px-6 lg:mx-20 2xl:px-24">
        <h2
          id="about-heading"
          className="mb-6 font-garamond text-[2.4rem] font-bold text-green-700 md:mb-8 md:text-[3rem]"
        >
          About Us:
        </h2>

        <div className="flex flex-col gap-4 @min-[65rem]/about-layout:flex-row @min-[65rem]/about-layout:items-stretch">
          {aboutCards.map((card, index) => {
            const isActive = activeCard === index;

            return (
              <article
                key={card.id}
                className={`relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl bg-gray-900 p-8 text-white transition-[flex-grow,min-height] duration-400 ease-in-out lg:p-9 xl:p-12
                  @min-[65rem]/about-layout:h-[40rem] @min-[65rem]/about-layout:min-h-[40rem] @min-[65rem]/about-layout:min-w-[21rem]
                  @min-[65rem]/about-layout:flex-[0_0_21rem]
                  motion-reduce:transition-none
                  ${isActive ? "min-h-[26rem] @min-[65rem]/about-layout:grow" : "min-h-[12rem]"}`}
                data-expanded={isActive}
                onPointerEnter={(event) => activateHoveredCard(event, index)}
                onPointerMove={(event) => activateHoveredCard(event, index)}
                onFocus={() => setActiveCard(index)}
              >
                <img
                  src={publicAsset(card.image)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 -z-20 size-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 bg-green-950/80"
                />

                {/* The label's width controls its font size as the card expands. */}
                <p className="@container mb-8 flex min-h-12 w-[calc(100%_-_3.75rem)] items-center font-garamond leading-[1.25] font-semibold whitespace-nowrap [text-shadow:0_2px_6px_rgb(0_0_0_/_85%)]">
                  <span className="mr-[0.4em] shrink-0 tabular-nums text-yellow-500 [font-size:min(2rem,13cqw)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="shrink-0 [font-size:min(2rem,13cqw)]">
                    {card.label}
                  </span>
                </p>

                <button
                  id={`${card.id}-trigger`}
                  type="button"
                  aria-labelledby={`${card.id}-heading`}
                  aria-expanded={isActive}
                  aria-controls={`${card.id}-content`}
                  onClick={() => setActiveCard(index)}
                  className="absolute top-8 right-8 flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/70 text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-yellow-500 md:size-12 lg:top-9 lg:right-9 xl:top-12 xl:right-10"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="size-6"
                  >
                    <path d="M5 12h14" />
                    <path
                      className={`origin-center transition-transform duration-200 ease-[ease] motion-reduce:transition-none ${isActive ? "scale-y-0" : "scale-y-100"}`}
                      d="M12 5v14"
                    />
                  </svg>
                </button>

                <h3
                  id={`${card.id}-heading`}
                  className={`mt-auto font-garamond text-[2rem] leading-tight font-semibold text-amber-400 wrap-break-word [text-shadow:0_2px_6px_rgb(0_0_0_/_85%)] ${isActive ? "lg:text-[2.6rem]" : "lg:text-[2.25rem]"}`}
                >
                  {card.title}
                </h3>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-400 ease-in-out motion-reduce:transition-none ${isActive ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
                  aria-hidden={isActive}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="pt-4 font-garamond text-xl leading-relaxed text-white [text-shadow:0_2px_6px_rgb(0_0_0_/_85%)]">
                      <span className="max-w-[30ch] line-clamp-3">{card.summary}</span>
                    </p>
                  </div>
                </div>

                <div
                  id={`${card.id}-content`}
                  role="region"
                  aria-labelledby={`${card.id}-heading`}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  className={`grid transition-[grid-template-rows,visibility] duration-400 ease-in-out motion-reduce:transition-none ${isActive ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className={`pt-4 transition-[opacity,translate] duration-200 ease-[ease] motion-reduce:translate-y-0 motion-reduce:transition-none ${isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                      <p className="max-w-3xl font-garamond text-xl leading-relaxed text-pretty text-white [text-shadow:0_2px_6px_rgb(0_0_0_/_85%)] sm:text-[1.45rem]">
                        {card.description}
                      </p>
                      <Link
                        to={card.link}
                        className="mt-6 inline-flex max-w-full items-center gap-3 rounded-full bg-green-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500 motion-reduce:transition-none lg:text-lg"
                      >
                        {card.linkLabel}
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5 shrink-0"
                        >
                          <path d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
