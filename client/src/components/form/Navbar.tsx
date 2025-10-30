/** @format */
import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#070123] shadow-md border-b border-[#1f1b3a] py-3 top-0 left-0 z-[100]">
      <div
        className="
          mx-auto
          grid 
          grid-cols-2 
          items-center
        "
      >
        {/* Left Logo */}
        <div className="flex justify-start pl-10 md:pl-40">
          <img
            src="/nav_pic.png"
            alt="Logo Left"
            className="h-10 md:h-16 w-auto object-contain"
          />
        </div>

        {/* Right Logo */}
        <div className="flex justify-end pr-10 md:pr-40">
          <img
            src="/nav_pic2.png"
            alt="Logo Right"
            className="h-10 md:h-16 w-auto object-contain"
          />
        </div>
      </div>
    </nav>
  );
}
