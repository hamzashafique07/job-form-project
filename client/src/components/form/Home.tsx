// client/src/components/form/Home.tsx
/** @format */

import React, { useState } from "react";
import MultiStepForm from "./MultiStepForm";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="pt-20 bg-[#506996] flex flex-col justify-center px-6 md:px-40 overflow-hidden">
      {/* Content Container */}
      <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
        {/* Left Side — Text & Button */}
        <div className="text-white max-w-xl ">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-snug">
            You could be owed{" "}
            <span className="text-yellow-300 underline decoration-yellow-400">
              £0,000*
            </span>{" "}
            per car finance agreement
          </h1>

          <h2 className="text-lg font-light text-white py-3">
            Find your last 7 years agreements instantly and submit your claim:
          </h2>

          <div className="text-white">
            <ul>
              <li className="flex items-center md:text-lg font-light md:mb-2 mb-1">
                <img
                  className="object-contain h-5 w-5 mr-2"
                  src="/tick.png"
                  alt="icon"
                />
                <span className="font-semibold pr-1">No</span> Paper work
              </li>

              <li className="flex items-center md:text-lg font-light md:mb-2 mb-1">
                <img
                  className="object-contain h-5 w-5 mr-2"
                  src="/tick.png"
                  alt="icon"
                />
                <span className="font-semibold pr-1">No</span> win–
                <span className="font-semibold pr-1">No</span> Fee
              </li>

              <li className="flex items-center md:text-lg font-light md:mb-2 mb-1">
                <img
                  className="object-contain h-5 w-5 mr-2"
                  src="/tick.png"
                  alt="icon"
                />
                Submit in less than{" "}
                <span className="font-semibold px-1">60</span> seconds
              </li>
            </ul>
          </div>

          {/* Show Button only when form not visible */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xl mb-20 mt-6 bg-[#0B0B28] hover:bg-[#1a1a3d] text-white font-bold py-6 px-10 rounded-lg shadow-lg transition-all duration-300"
            >
              Find My Agreements
            </button>
          )}
        </div>

        {/* Right Side — Car Image */}
        <div className="mt-10 md:mt-0 md:ml-8 flex items-center justify-center">
          <img
            src="/bmw.png"
            alt="BMW Car"
            className="max-h-[260px] md:max-h-[320px] w-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Form (appears below main content) */}
      {showForm && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-20">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 relative">
            <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
              Start Your Claim
            </h2>
            <MultiStepForm />
            <button
              onClick={() => setShowForm(false)}
              className="mt-6 block mx-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
