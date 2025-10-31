//client/src/components/form/Claimf1.tsx
/** @format */
import React from "react";

export default function ClaimForm1() {
  return (
    <section className="w-full bg-[#0e092b] text-white py-10 px-6 md:px-12 lg:px-24 flex justify-center items-center">
      <div className="max-w-5xl text-center">
        <h2 className="text-2xl md:text-2xl lg:text-3xl font-semibold mb-3 leading-snug">
          Could you be entitled to receive compensation?
        </h2>

        <p className="text-base md:text-lg text-gray-200 mb-8">
          Our expert panel covers various different products and provides all
          clients with the best possible outcome to their claim.
        </p>

        <div className="space-y-5 text-gray-300 text-sm md:text-base leading-relaxed">
          <p>
            Our check is{" "}
            <span className="font-semibold text-white">100% free</span>. Once we
            present the results of our assessment, we will make a suggestion to
            you from our panel of Solicitors, but you are under no obligation to
            proceed. Our Solicitors work on a no win no fee basis which may
            include Legal Expenses and cancellation charges for any claim
            cancelled after the 14-day cooling-off period. You will have the
            chance to review the Solicitor paperwork once we complete our
            initial work and identify a valid claim. We may receive a referral
            from your Solicitor, but you do not need to pay us anything.
          </p>

          <p>
            You do not need to use a claims management company to make a claim
            for compensation. It is possible for the customer to present the
            claim themselves for free, either to the person against whom they
            wish to complain or to the relevant Financial Ombudsman Service
            (FOS) or the statutory compensation scheme (FSCS).
          </p>

          <p>
            When a claim is referred to a 3rd party (e.g. a law firm), fees will
            be charged at no more than{" "}
            <span className="font-semibold text-white">30% + VAT</span>. The
            respective fee will always be clearly outlined to all clients at the
            time of referral and the client will be given the opportunity to
            decide whether or not to proceed on that basis.
          </p>
        </div>
      </div>
    </section>
  );
}
