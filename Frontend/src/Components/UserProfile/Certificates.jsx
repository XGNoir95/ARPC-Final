// src/Components/Certificates.jsx
import React from "react";

const Certificates = ({ certificates }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl px-6 sm:px-10 py-7">
      <h2 className="text-[2.2rem] md:text-[2.5rem] font-garamond font-bold bg-gradient-to-r from-[#133729] to-green-700 bg-clip-text text-transparent inline-block mb-4">
        Certificates
      </h2>

      {(!certificates || certificates.length === 0) ? (
        <p className="text-[1.1rem] text-gray-600 font-garamond">
          You don&apos;t have any certificate-eligible events yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {certificates.map((cert) => (
            <li
              key={cert.id}
              className="border border-gray-300 rounded-xl px-4 sm:px-6 py-8
                         flex flex-col lg:flex-row
                         items-center lg:items-center
                         lg:justify-between gap-3 bg-[#fdfefe]"
            >
              <div className="text-center lg:text-left">
                <p className="text-[1.6rem] font-garamond font-semibold text-green-900">
                  {cert.title}
                </p>
                <p className="text-[0.95rem] md:text-[1.2rem] text-gray-600">
                  Event Date: {cert.eventDate}
                </p>
                <p className="text-[0.98rem] md:text-[1.03rem] text-green-700 mt-2">
                  Status: {cert.status}
                </p>
              </div>

              <button
                type="button"
                className="self-center lg:self-auto mt-2 lg:mt-0
                           px-12 lg:px-10 py-2.5 rounded-full bg-green-700 text-white
                           text-[1.25rem] font-semibold font-garamond
                           hover:bg-green-800 transition"
              >
                {/* sm: "Generate" | md+lg: "Generate Certificate" */}
                <span className="inline md:hidden">Generate</span>
                <span className="hidden md:inline">Generate Certificate</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Certificates;
