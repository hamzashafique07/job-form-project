// client/src/components/form/Faq.tsx
/** @format */
import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqItems = [
  {
    question: "What is PCP?",
    answer:
      "Personal Contract Purchase (PCP) is effectively a personal loan which allows drivers to spread the payments for a vehicle over a long period, typically two or three years.However, unlike a normal personal loan, you won’t be paying off the full value of the car and you won’t necessarily own it at the end of the dea, unless you choose to pay the final balloon payment.PCP is one of the more complex financial products available to help you buy a car, but it can be broken down into three main parts: the deposit, the amount you borrow and the balloon payment.",
  },
  {
    question: "How do I make the claim process as quick as possible?",
    answer:
      "The more details you can recall about your agreement, the more likely it will be that the finance company can locate and verify you against their systems promptly.This will also help avoid requests for further information which can delay a decision being made.",
  },
  {
    question: "Why do dealers offer PCP finance?",
    answer:
      "Dealers use PCP finance to draw in people who want to change their car every few years. *73% of new cars in 2014 were bought using PCP, making it the most prevalent financial product in the market.",
  },
  {
    question: "What if I don't have the paperwork to make a claim?",
    answer:
      "It is mandatory for car finance companies to keep records of all their customer’s transactions and dealings for at least 6 years.",
  },
  {
    question: "Can I still make a claim without my paperwork?",
    answer:
      "If you paid off your Finance Deal more than 6 years ago, there may not be any available paperwork for you.However, there have been cases in which claims have been made against cases of mis-selling over 20 years ago, often without paperwork.",
  },
  {
    question: "Why is the mis-selling scandal only now coming to light?",
    answer:
      "The misconception around car finance is that the product being sold is a car.This is only partly true. In fact, the main product that is being sold is a financial product which is a loan.The car is a red herring that has deflected the public eye away from this sector of credit broking meaning it has not been under as much scrutiny as, say, mortgages.The concept of PCP itself is also relatively new.",
  },
  {
    question: "How much will I have to borrow?",
    answer:
      "The amount you will have to borrow is based on how much value the finance company predicts the car will lose over the term of the deal (usually 24 or 36 months) minus the deposit you’ve put down.You will pay this amount off during the deal, plus interest.So, you are not paying off the full value of the car. Typical annual percentage rates (APRs) start from around 4%.",
  },
  {
    question: "Our Fees",
    answer: (
      <div className="text-gray-600 text-sm md:text-base">
        <p className="mb-4">
          Our fees are shown exclusive of VAT and will be charged at the
          applicable VAT rate. Here’s a breakdown of our fee structure:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold border-b">
                  Band
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b">
                  Redress
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b">
                  Received % Fees
                </th>
                <th className="py-3 px-4 text-left font-semibold border-b">
                  Maximum fee
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["A", "1–1,499", "30.00%", "£420"],
                ["B", "1,500–9,999", "28.00%", "£2,500"],
                ["A", "10,000–24,999", "25.00%", "£5,000"],
                ["B", "25,000–49,999", "20.00%", "£7,500"],
                ["A", "50,000+", "15.00%", "£10,000"],
              ].map(([band, redress, fees, max], i) => (
                <tr key={i} className="border-t">
                  <td className="py-3 px-4">{band}</td>
                  <td className="py-3 px-4">{redress}</td>
                  <td className="py-3 px-4">{fees}</td>
                  <td className="py-3 px-4">{max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">
          These fees are in line with the FCA guidelines on compensation refunds
          of up to £49,999.
        </p>
        <p className="mt-2 font-medium">
          Reclaim Finance will act on a{" "}
          <span className="font-semibold">‘NO WIN NO FEE’</span> basis, and
          there are no administration charges or hidden fees payable. Our
          charging rates are set in bands depending upon the amount of redress
          or refund you receive.
        </p>
      </div>
    ),
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <section className="w-full min-h-screen flex justify-center items-start py-16 px-4 bg-white">
      <div className="max-w-3xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-800">
          FAQs
        </h2>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl shadow-sm transition-all duration-200"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50"
              >
                <span>{item.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-gray-800" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-800" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 text-gray-600 text-sm md:text-base">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-20 px-4">
          <p className="text-center text-gray-700 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            To read more information on the facts referenced on our website you
            can go to this article on the FCA’s website{" "}
            <a
              href="https://www.fca.org.uk/consumers/car-finance-complaints"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 font-medium hover:underline break-words"
            >
              https://www.fca.org.uk/consumers/car-finance-complaints
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
