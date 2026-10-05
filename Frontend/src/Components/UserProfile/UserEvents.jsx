// src/Components/UserEvents.jsx
import React from "react";

const UserEvents = ({ events }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl px-6 sm:px-10 py-7">
      <h2 className="text-[2.2rem] md:text-[2.5rem] font-garamond font-bold bg-gradient-to-r from-[#133729] to-green-700 bg-clip-text text-transparent inline-block mb-5">
        Participated Events
      </h2>

      {(!events || events.length === 0) ? (
        <p className="text-[1.1rem] text-gray-600 font-garamond">
          You haven&apos;t participated in any events yet.
        </p>
      ) : (
        <div className="space-y-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="border border-gray-300 rounded-xl px-4 sm:px-6 py-10 bg-[#fdfefe]
                         flex flex-col lg:flex-row
                         items-center lg:items-center
                         lg:justify-between gap-2"
            >
              <div className="text-center lg:text-left">
                <p className="text-[1.6rem] font-garamond font-semibold text-green-900">
                  {ev.title}
                </p>
                <p className="text-[1.1rem] md:text-[1.2rem] text-gray-600">
                  {ev.date}
                </p>
              </div>

              {/* View Event button */}
              <button
                type="button"
                className="self-center lg:self-auto mt-4 lg:mt-0
                           px-12 lg:px-10 py-2.5 rounded-full bg-green-700 text-white
                           text-[1.25rem] font-semibold font-garamond
                           hover:bg-green-800 transition"
              >
                View Event
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserEvents;
