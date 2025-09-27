//client/src/components/ui/Checkbox.tsx
/** @format */
import { FieldError } from "react-hook-form";

type Props = {
  label: string;
  error?: FieldError;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectInput({ label, error, options, ...props }: Props) {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">{label}</label>
      <select
        {...props}
        className={`border rounded p-2 w-full ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error.message}</p>
      )}
    </div>
  );
}
