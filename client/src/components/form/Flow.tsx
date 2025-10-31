//client/src/components/form/Flow.tsx
/** @format */
import React from "react";

export default function Flow() {
  const steps = [
    {
      id: 1,
      title: "Step 1",
      description: "Find your agreements",
      icon: "./svg1.png",
    },
    {
      id: 2,
      title: "Step 2",
      description: "Select agreements",
      icon: "./svg2.png",
    },
    {
      id: 3,
      title: "Step 3",
      description: "Submit Claim",
      icon: "./svg3.png",
    },
  ];

  return (
    <section className="w-full bg-[#0B032D] text-white py-16 px-4 md:px-12 lg:px-24">
      {/* Heading Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl md:text-4xl font-semibold mb-3">
          Just 3 Steps to More Justice
        </h2>
        <p className="text-xl font-light text-center pt-3 text-white">
          Follow these easy steps to get the compensation you deserve and hold
          the companies accountable for mis-sold PCP agreements.
        </p>
      </div>

      {/* Steps Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {steps.map((step) => (
          <div
            key={step.id}
            className="bg-white text-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 w-full max-w-sm p-6 flex flex-col items-center text-center"
          >
            <img
              src={step.icon}
              alt={step.title}
              className="h-20 w-20 mb-4 object-contain"
            />
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              {step.title}
            </h3>
            <p className="text-lg text-zinc-950">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
