//client/src/components/form/Banner.tsx
/** @format */
import React from "react";
export default function Banner() {
  return (
    <div>
      <div className="bg-white text-gray-900 mt-16 py-10 px-4 rounded-xl text-center">
        <h3 className="text-2xl md:text-4xl font-semibold mb-2">
          Dont miss out! you could be owed £700 per vehicle*
        </h3>
        <p className=" text-zinc-950 text-xl md:text-base max-w-3xl mx-auto mb-6">
          You could have one of the *22Million effected agreements. *£33Billion
          is being paid out to people who have had PCP over the next 2 years.
        </p>
        <button className="bg-[#506996] hover:bg-[#405478] text-lg text-white font-semibold py-3 px-8 rounded-lg transition-colors">
          Find my Agreements
        </button>
      </div>
    </div>
  );
}
