//cleint/src/components/form/Window.tsx
/** @format */
import React from "react";

export default function Window() {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between bg-[#0B032D] text-white overflow-hidden">
      {/* Left Content */}
      <div className="w-full md:w-1/2 px-6 md:px-16 py-16 z-[3]">
        <h2 className="text-2xl md:text-4xl font-semibold mb-6 leading-snug">
          How Do You Know If Your PCP Was Mis-Sold?
        </h2>

        <p className="text-gray-300 mb-6 text-sm md:text-base">
          If any of the following statements apply to you, you may be entitled
          to thousands of pounds in compensation from a PCP claim:
        </p>

        <ul className="space-y-3 text-gray-200 text-sm md:text-base">
          <li className="flex items-start gap-2">
            <span className="text-[#506996] mt-[2px]">→</span>
            The finance company did not inform you about any sales commissions.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#506996] mt-[2px]">→</span>
            The finance company disclosed that they received a commission but
            did not specify the amount.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#506996] mt-[2px]">→</span>
            You paid a high interest rate on your PCP finance.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#506996] mt-[2px]">→</span>
            You purchased a car through a PCP deal within the last *7 years.
          </li>
        </ul>

        <button className="mt-8 bg-[#506996] hover:bg-[#405478] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200">
          Find my Agreements
        </button>
      </div>
      <div className="w-full md:w-1/2">
        <img
          className=" h-150 w-350 border rounded"
          src="./mercedes.png"
          alt="Car driving on street"
        />
      </div>
    </section>
  );
}
