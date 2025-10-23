//client/src/components/form/LoadingScreen.tsx
/** @format */
import React from "react";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-6"></div>
      <h2 className="text-2xl font-semibold text-gray-800">
        Submitting your form…
      </h2>
      <p className="text-gray-500 mt-2">
        Please wait while we process your information securely.
      </p>
    </div>
  );
}
