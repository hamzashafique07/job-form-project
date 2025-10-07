//client/src/components/ui/SignatureCanvas.tsx
/** @format */
import React, { useRef } from "react";
import SignatureCanvasLib from "react-signature-canvas";

type Props = {
  value?: string; // base64 string
  onChange: (base64: string) => void;
  error?: string;
};

export default function SignatureCanvas({ value, onChange, error }: Props) {
  const sigRef = useRef<SignatureCanvasLib>(null);

  const handleEnd = () => {
    if (sigRef.current) {
      // ✅ Patch: use getCanvas() instead of getTrimmedCanvas() to avoid runtime error
      const canvas = sigRef.current.getCanvas();
      const base64 = canvas.toDataURL("image/png");
      onChange(base64);
    }
  };

  const clear = () => {
    sigRef.current?.clear();
    onChange("");
  };

  return (
    <div className="mb-4">
      <label className="block font-medium mb-2">Signature</label>
      <div className="border rounded-md p-2">
        <SignatureCanvasLib
          ref={sigRef}
          penColor="black"
          canvasProps={{
            className: "w-full h-40 bg-white rounded-md",
          }}
          onEnd={handleEnd}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-2 text-sm text-blue-600 underline"
      >
        Clear
      </button>
      {error && <p className="text-red-600 mt-1">{error}</p>}
    </div>
  );
}
