// src/components/Sponsors.jsx
import React from "react";
import Marquee from "react-fast-marquee";
import { publicAsset } from "../../utils/publicAsset";

const sponsors = [
  { id: 1, src: "/sponsors/alfalaq.png", alt: "Al-Falaq" },
  { id: 2, src: "/sponsors/shomokalin.jpg", alt: "Shomokalin" },
  { id: 3, src: "/sponsors/sean.jpg", alt: "Sean Publication" },
  { id: 4, src: "/sponsors/luncheon.png", alt: "Luncheon" },
  { id: 5, src: "/sponsors/acd.png", alt: "Academy for Community Development" },
  { id: 6, src: "/sponsors/assunnah.png", alt: "As-Sunnah Foundation" },
  { id: 7, src: "/sponsors/sattayan.png", alt: "Sattayan" },
];

const Sponsors = () => {
  return (
    <section className="bg-white lg:py-15 py-15 mb-12">
      <div className="max-w-8xl lg:mx-20 px-6 2xl:px-24">
        <h2 className="text-[2.4rem] md:text-[3rem] font-garamond font-bold text-green-700 mb-10">
          Our Affiliations:
        </h2>

        <div className="space-y-12 overflow-hidden">
          {/* TOP ROW – bigger, slower, LEFT ➜ RIGHT */}
          <Marquee
            direction="right"
            speed={25}          // smaller = slower
            gradient={false}
            pauseOnHover={true}

          >
            {sponsors.map((logo) => (
              <div
                key={`top-${logo.id}`}
                className="flex items-center justify-center mx-7"
              >
                <img
                  src={publicAsset(logo.src)}
                  alt={logo.alt}
                  className="h-40 w-auto md:h-60 object-contain"
                />
              </div>
            ))}
          </Marquee>

          {/* BOTTOM ROW – smaller, faster, RIGHT ➜ LEFT */}
          <Marquee
            direction="left"
            speed={50}          // larger = faster
            gradient={false}
            pauseOnHover={true}
            className="py-4"
          >
            {sponsors.map((logo) => (
              <div
                key={`bottom-${logo.id}`}
                className="flex items-center justify-center mx-4"
              >
                <img
                  src={publicAsset(logo.src)}
                  alt={logo.alt}
                  className="h-20 w-auto md:h-32 object-contain opacity-95"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
