//client/src/components/form/ThankYouScreen.tsx
/** @format */
import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function ThankYouScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <CheckCircle2 className="text-green-500 w-16 h-16 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank you!</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Your application has been submitted successfully. We’ll be in touch
        shortly.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Submit Another Form
      </button>
    </div>
  );
}
