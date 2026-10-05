// src/components/FeaturedEvents.jsx
import React, { useState, useEffect } from "react";
import { publicAsset } from "../../utils/publicAsset";

const events = [
  {
    id: 1,
    title: "Islamic Quiz Competition – Ma'ariful Islamiyyah",
    subtitle: "Season 3 · Book: Riyad as-Salihin",
    description:
      "Test your knowledge and deepen your understanding through a friendly and engaging quiz competition based on selected chapters from Riyad as-Salihin. Participants will answer questions on hadith, key lessons, and practical implementations in daily life, making it both a fun and spiritually uplifting experience.",
    date: "30th September, 2025",
    time: "3:00 PM",
    place: "Online",
    image: "/event1.png",
  },
  {
    id: 2,
    title: "Tafsir & Reflection Circle ",
    subtitle: "Exploring selected ayat together",
    description:
      "Join us for a calm and reflective circle where we read, translate, and discuss selected ayat from the Qur’an together. The session will focus on drawing practical lessons, asking questions, and sharing personal reflections in a warm and welcoming environment.",
    date: "15th October, 2025",
    time: "4:30 PM",
    place: "AUST Campus",
    image: "/event1.png",
  },
  {
    id: 3,
    title: "Seerah Storytelling Evening",
    subtitle: "Lessons from the life of the Prophet ﷺ",
    description:
      "Spend an evening listening to beautifully narrated stories from the Seerah of the Prophet ﷺ, highlighting defining moments from his blessed life. Each story will be followed by short reflections and takeaways to help us apply these lessons in our studies, families, and community work.",
    date: "28th October, 2025",
    time: "5:00 PM",
    place: "AUST Auditorium",
    image: "/event1.png",
  },
];

const FeaturedEvents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === events.length - 1 ? 0 : prev + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white py-12">
      <div className="max-w-8xl lg:mx-20 px-6 2xl:px-24">
        {/* Heading + intro text */}
        <div>
          <h2 className="text-[2.4rem] md:text-[3rem] font-garamond font-bold text-green-700 mb-4">
            Featured Events:
          </h2>
          <p className="text-[1.6rem] md:text-[2rem] leading-relaxed font-garamond text-gray-800 text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.
          </p>
        </div>

        {/* Slider viewport */}
        <div className="mt-12 flex items-center justify-center">
          <div className="w-full max-w-8xl bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
            {/* Slider track */}
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {events.map((event) => {
                const isLongTitle = event.title.length > 45;

                // Same base size on sm; only md+ changes
                const titleSizeClasses = isLongTitle
                  ? "text-[1.8rem] md:text-[2.4rem]"
                  : "text-[1.8rem] md:text-[3rem]";

                // Clamp: always 4 lines on sm, dynamic on md+
                const smClampClass = "line-clamp-4";
                const mdUpClampClass = isLongTitle
                  ? "md:line-clamp-4 lg:line-clamp-5"
                  : "md:line-clamp-5";

                return (
                  <div
                    key={event.id}
                    className="
                      w-full flex-shrink-0
                      flex flex-col lg:flex-row
                      md:min-h-[34rem]
                    "
                  >
                    {/* Left: image */}
                    <div className="w-full lg:w-1/2 flex-shrink-0">
                      <img
                        src={publicAsset(event.image)}
                        alt={event.title}
                        className="
                          w-full
                          h-auto
                          max-h-[28rem]
                          md:max-h-[32rem]
                          lg:max-h-none
                          object-contain
                          lg:h-full lg:object-cover
                        "
                      />
                    </div>

                    {/* Right: details */}
                    <div
                      className="
                        w-full lg:w-1/2
                        p-6 md:p-8 md:px-10
                        flex flex-col
                        flex-1
                      "
                    >
                      {/* Content block */}
                      <div className="flex-1">
                        {/* Title */}
                        <h3
                          className={`${titleSizeClasses} font-garamond font-bold text-green-700 mb-2 line-clamp-2`}
                        >
                          {event.title}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-lg md:text-[1.8rem] font-garamond text-amber-700 mb-5 truncate">
                          {event.subtitle}
                        </p>

                        {/* Event description heading */}
                        <p className="text-lg md:text-[1.8rem] font-garamond font-semibold text-green-700 mb-2">
                          Event Description:
                        </p>

                        {/* Description */}
                        <p
                          className={`
                            text-lg md:text-2xl font-garamond text-gray-800
                            leading-relaxed mb-5 text-justify
                            ${smClampClass} ${mdUpClampClass}
                          `}
                        >
                          {event.description}
                        </p>

                        {/* Row-wise details with custom green icons */}
                        <div className="space-y-3 text-lg md:text-[1.5rem] font-garamond text-gray-800 mb-6">
                          {/* Date row */}
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-green-700">
                              <svg
                                className="w-7 h-7 md:w-9 md:h-9"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="17"
                                  rx="2"
                                  ry="2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <line
                                  x1="3"
                                  y1="9"
                                  x2="21"
                                  y2="9"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <line
                                  x1="9"
                                  y1="3"
                                  x2="9"
                                  y2="7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <line
                                  x1="15"
                                  y1="3"
                                  x2="15"
                                  y2="7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx="9"
                                  cy="13"
                                  r="1.1"
                                  fill="currentColor"
                                />
                                <circle
                                  cx="15"
                                  cy="17"
                                  r="1.1"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                            <p>
                              <span className="font-semibold">Date:</span>{" "}
                              {event.date}
                            </p>
                          </div>

                          {/* Time row */}
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-green-700">
                              <svg
                                className="w-7 h-7 md:w-9 md:h-9"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <line
                                  x1="12"
                                  y1="12"
                                  x2="12"
                                  y2="7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <line
                                  x1="12"
                                  y1="12"
                                  x2="16"
                                  y2="14"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </span>
                            <p>
                              <span className="font-semibold">Time:</span>{" "}
                              {event.time}
                            </p>
                          </div>

                          {/* Place row */}
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-green-700">
                              <svg
                                className="w-7 h-7 md:w-9 md:h-9"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 21s-6-6.3-6-11a6 6 0 0 1 12 0c0 4.7-6 11-6 11z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="12"
                                  cy="10"
                                  r="2.2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                            </span>
                            <p>
                              <span className="font-semibold">Place / Type:</span>{" "}
                              {event.place}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Register butto */}
                      <div className="mt-6 md:mt-auto">
                        <button className=" w-full px-8 py-3 rounded-full bg-green-700 text-white text-lg md:text-xl font-semibold shadow-lg hover:bg-green-800 transition">
                          Register now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slider status bar */}
        <div className="mt-10 flex justify-center gap-3">
          {events.map((event, index) => (
            <button
              key={event.id}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to event ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-10 bg-green-700"
                  : "w-6 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
