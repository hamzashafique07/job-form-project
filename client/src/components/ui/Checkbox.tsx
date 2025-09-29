//client/src/components/ui/Checkbox.tsx
/** @format */
import { FieldError } from "react-hook-form";

type Props = {
  label: string;
  error?: FieldError;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Checkbox({ label, error, ...props }: Props) {
  return (
    <div className="mb-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...props}
          className={`h-4 w-4 rounded border ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        <span>{label}</span>
      </label>
      {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
