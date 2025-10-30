//client/src/components/form/Navbar.tsx
/** @format */
import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#070123] shadow-md border-b border-[#1f1b3a] pt-3 pb-3 pl-40 pr-40  top-0 left-0 z-100">
      <div className=" mx-auto flex items-center justify-between  ">
        <div className="flex items-center space-x-275">
          <img
            src="/nav_pic.png"
            alt="Logo"
            className="md:h-16 h-full w-full object-contain "
          />
          <img
            src="/nav_pic2.png"
            alt="Logo"
            className="md:h-14 h-10 w-full object-contain"
          />
        </div>
      </div>
    </nav>
  );
}
