//client/src/components/ui/ErrorSummary.tsx
/** @format */
type Props = {
    errors: { field: string; message: string }[];
  };
  
  export default function ErrorSummary({ errors }: Props) {
    if (!errors || errors.length === 0) return null;
  
    return (
      <div className="mb-4 p-3 border border-red-400 bg-red-50 rounded">
        <p className="font-medium text-red-700 mb-2">Please fix the following:</p>
        <ul className="list-disc pl-5 text-red-700 text-sm">
          {errors.map((err, idx) => (
            <li key={idx}>{err.message}</li>
          ))}
        </ul>
      </div>
    );
  }
  