// src/Pages/Profile.jsx
import React, { useState } from "react";
import UserInfo from "../Components/UserProfile/UserInfo";
import Certificates from "../Components/UserProfile/Certificates";
import UserEvents from "../Components/UserProfile/UserEvents";

const defaultUser = {
  name: "Sample Member",
  email: "member@arpc.club",
  department: "Department of Computer Science & Engineering",
  phone: "+8801XXXXXXXXX",
  batch: "22.1.1",
  studentId: "20XX010XXX",
  bloodGroup: "O+",
  city: "Dhaka",
  university: "Ahsanullah University of Science & Technology",
};

const sampleCertificates = [
  {
    id: 1,
    title: "Introductory Dawah Workshop",
    eventDate: "12 Jan 2025",
    status: "Ready to download",
  },
  {
    id: 2,
    title: "Ramadan Reflection Circle",
    eventDate: "03 Apr 2025",
    status: "Processing",
  },
];

const sampleEvents = [
  {
    id: 1,
    title: "Weekly Halaqah – Surah Yusuf",
    date: "08 Dec 2024",
    role: "Participant",
  },
  {
    id: 2,
    title: "Charity Drive – Winter Clothes",
    date: "15 Dec 2024",
    role: "Volunteer",
  },
  {
    id: 3,
    title: "Campus Dawah Booth",
    date: "05 Jan 2025",
    role: "Organizer",
  },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("info"); // "info" | "certs" | "events"
  const [user, setUser] = useState(defaultUser);

  const handleLogout = () => {
    // plug in your real logout logic here
    console.log("Logging out…");
  };

  return (
    <section className="bg-white py-12">
      <div className="max-w-8xl lg:mx-20 px-6 2xl:px-24 mx-auto">
        {/* TOP CARD: avatar + name + tabs + logout */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10 pb-3">
          {/* Header area */}
          <div className="bg-gradient-to-r from-[#0E291E] via-[#133729] to-green-700 px-6 sm:px-10 pt-8 pb-8 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-[230px] h-[230px] rounded-full overflow-hidden border-[6px] border-white shadow-xl bg-white">
              <img
                src="https://pbs.twimg.com/profile_images/1328353245408993280/xooFrrYm_400x400.jpg"
                alt="Profile avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name + email */}
            <h1 className="mt-6 text-[2rem] md:text-[2.4rem] font-garamond font-bold text-white">
              {user.name}
            </h1>
            <p className="text-[1.1rem] md:text-[1.25rem] text-green-100">
              {user.email}
            </p>
          </div>

          {/* Tabs + Logout */}
          <div className="px-4 sm:px-6 md:px-10 pb-4 pt-5 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`py-4 rounded-lg text-[1.25rem] md:text-[1.3rem] font-semibold font-garamond transition border border-gray-300
                ${
                  activeTab === "info"
                    ? "bg-gradient-to-r from-[#133729] to-green-700 text-white shadow-md"
                    : "bg-gray-100 text-green-800 hover hover:bg-gray-200"
                }`}
              >
                User Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("certs")}
                className={`py-4 rounded-lg text-[1.25rem] md:text-[1.3rem] font-semibold font-garamond transition border border-gray-300
                ${
                  activeTab === "certs"
                    ? "bg-gradient-to-r from-[#133729] to-green-700 text-white shadow-md"
                    : "bg-gray-100 text-green-800 hover hover:bg-gray-200"
                }`}
              >
                Certificates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={`py-4 rounded-lg text-[1.25rem] md:text-[1.3rem] font-semibold font-garamond transition border border-gray-300
                ${
                  activeTab === "events"
                    ? "bg-gradient-to-r from-[#133729] to-green-700 text-white shadow-md"
                    : "bg-gray-100 text-green-800 hover hover:bg-gray-200"
                }`}
              >
                Participated Events
              </button>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full mb-1 py-3.5 rounded-lg text-[1.25rem] md:text-[1.3rem] font-semibold font-garamond
              bg-amber-600 text-white hover:bg-amber-900 transition"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* LOWER CONTENT: tab panels */}
        {activeTab === "info" && (
          <UserInfo user={user} setUser={setUser} />
        )}
        {activeTab === "certs" && (
          <Certificates certificates={sampleCertificates} />
        )}
        {activeTab === "events" && (
          <UserEvents events={sampleEvents} />
        )}
      </div>
    </section>
  );
};

export default Profile;
