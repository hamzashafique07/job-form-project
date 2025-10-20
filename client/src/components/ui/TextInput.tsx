// client/src/components/ui/TextInput.tsx
import React from "react";
import type { FieldError } from "react-hook-form";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: FieldError | string; // ✅ allow both
};

export default function TextInput({ label, error, className, ...rest }: Props) {
  // Normalize message
  const message = typeof error === "string" ? error : error?.message;

  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-1 font-medium" htmlFor={rest.id}>
          {label}
        </label>
      )}
      <input
        {...rest}
        className={`w-full p-2 border rounded focus:outline-none focus:ring ${
          message ? "border-red-600 ring-red-100" : "border-gray-300"
        } ${className || ""}`}
      />
      {message && (
        <p className="text-sm text-red-600 mt-1" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
