// src/Components/ScholarQuotesPanel.jsx
import React, { useState, useEffect } from "react";

const scholars = [
  {
    name: "Ibn Kathir (رحمه الله)",
    title: "Qur’anic Exegete & Historian",
    quote:
      "The Qur’an is guidance for the heart that seeks, and mercy for the soul that returns to its Lord.",
    imageUrl:
      "https://salondesmaires-ain.fr/wp-content/uploads/2014/10/speaker-3.jpg",
  },
  {
    name: "Imam Al-Ghazali (رحمه الله)",
    title: "Theologian & Spiritual Master",
    quote:
      "Knowledge that does not bring you closer to Allah is a veil, not a light.",
    imageUrl:
      "https://salondesmaires-ain.fr/wp-content/uploads/2014/10/speaker-3.jpg",
  },
  {
    name: "Imam An-Nawawi (رحمه الله)",
    title: "Hadith Scholar & Jurist",
    quote:
      "Sincerity is that your actions are unseen by people, yet fully seen by your Lord.",
    imageUrl:
      "https://salondesmaires-ain.fr/wp-content/uploads/2014/10/speaker-3.jpg",
  },
  {
    name: "Ibn al-Qayyim (رحمه الله)",
    title: "Scholar of the Heart & Character",
    quote:
      "The heart finds peace when it leaves its desires and rests with its Lord.",
    imageUrl:
      "https://salondesmaires-ain.fr/wp-content/uploads/2014/10/speaker-3.jpg",
  },
  {
    name: "Ibn Taymiyyah (رحمه الله)",
    title: "Scholar of Creed & Law",
    quote:
      "Paradise is in the heart of the believer who is content with Allah in all states.",
    imageUrl:
      "https://salondesmaires-ain.fr/wp-content/uploads/2014/10/speaker-3.jpg",
  },
  {
    name: "Imam Ash-Shafi‘i (رحمه الله)",
    title: "Imam of Fiqh",
    quote:
      "Whoever desires a radiant heart must abandon sin as one abandons a burning ember.",
    imageUrl:
      "https://salondesmaires-ain.fr/wp-content/uploads/2014/10/speaker-3.jpg",
  },
  {
    name: "Hasan al-Basri (رحمه الله)",
    title: "Early Scholar & Ascetic",
    quote:
      "The dunya is three days: yesterday has gone, tomorrow is not guaranteed, so today is all you truly have.",
    imageUrl:
      "https://salondesmaires-ain.fr/wp-content/uploads/2014/10/speaker-3.jpg",
  },
];

const ScholarQuotesPanel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeScholar = scholars[activeIndex];

  // Rotate scholars every ~18 seconds
  useEffect(() => {
    const interval = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % scholars.length),
      18000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Panel – same *look* as your original, with improved height handling */}
      <div className="hidden lg:flex w-full lg:w-1/2 min-h-screen bg-gradient-to-b from-[#133729] to-green-700 text-white items-center justify-center px-6 py-12">

        <div
          key={activeIndex}
          className="max-w-2xl text-center space-y-6 scholar-fade"
        >
          {/* Scholar avatar */}
          <div className="flex justify-center">
            <img
              src={activeScholar.imageUrl}
              alt={activeScholar.name}
              className="rounded-full object-cover border-4 border-amber-400 shadow-md"
              style={{ width: 140, height: 140 }}
              loading="lazy"
            />
          </div>

          {/* Quote */}
          <div className="space-y-4">
            <p className="text-2xl md:text-3xl lg:text-[2.1rem] font-garamond font-semibold leading-snug">
              <span className="text-amber-400 text-4xl align-middle mr-2">“</span>
              <span className="align-middle">{activeScholar.quote}</span>
              <span className="text-amber-400 text-4xl align-middle ml-2">”</span>
            </p>
            <p className="text-sm md:text-base text-gray-100">
              Through events, circles, and projects, the portal keeps you
              connected to everything happening in the club.
            </p>
          </div>

          {/* Scholar name + title */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <p className="text-sm md:text-[1.6rem] font-semibold text-amber-400">
              {activeScholar.name}
            </p>
            <p className="text-xs md:text-[1.15rem] text-gray-100">
              {activeScholar.title}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScholarQuotesPanel;
