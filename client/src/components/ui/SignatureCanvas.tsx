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
    if (!sigRef.current) return;

    // Get original canvas
    const canvas = sigRef.current.getCanvas();

    // Temporary canvas for compression
    const tmp = document.createElement("canvas");
    const scale = 0.6; // safe range 0.5–0.7
    tmp.width = canvas.width * scale;
    tmp.height = canvas.height * scale;

    const ctx = tmp.getContext("2d");
    if (!ctx) return;

    // ✅ Fill white background to preserve signature contrast
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, tmp.width, tmp.height);

    // ✅ Draw signature content on top
    ctx.drawImage(canvas, 0, 0, tmp.width, tmp.height);

    // ✅ Export compressed JPEG (still small)
    const compressedBase64 = tmp.toDataURL("image/jpeg", 0.3);

    onChange(compressedBase64);
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
