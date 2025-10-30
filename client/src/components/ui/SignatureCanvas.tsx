//client/src/compon
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

    const canvas = sigRef.current.getCanvas();
    if (!canvas) return;

    // --- create temporary canvas for compression ---
    const tmp = document.createElement("canvas");
    const scale = 0.5; // slightly smaller than before (0.6 → 0.5)
    tmp.width = canvas.width * scale;
    tmp.height = canvas.height * scale;

    const ctx = tmp.getContext("2d");
    if (!ctx) return;

    // --- white background for proper contrast ---
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, tmp.width, tmp.height);

    // --- draw the signature scaled down ---
    ctx.drawImage(canvas, 0, 0, tmp.width, tmp.height);

    // --- export with adaptive compression ---
    // WebP gives better compression; fallback to JPEG if not supported
    let compressedBase64 = "";
    try {
      compressedBase64 = tmp.toDataURL("image/webp", 0.2); // smaller than before (0.3 → 0.2)
    } catch {
      compressedBase64 = tmp.toDataURL("image/jpeg", 0.25);
    }

    // Extra safety: if still huge (> 100 KB), re-compress smaller
    if (compressedBase64.length > 100000) {
      const img = new Image();
      img.src = compressedBase64;
      img.onload = () => {
        const small = document.createElement("canvas");
        const smallerScale = 0.4;
        small.width = img.width * smallerScale;
        small.height = img.height * smallerScale;
        const c2 = small.getContext("2d");
        if (!c2) return;
        c2.fillStyle = "white";
        c2.fillRect(0, 0, small.width, small.height);
        c2.drawImage(img, 0, 0, small.width, small.height);
        onChange(small.toDataURL("image/jpeg", 0.2));
      };
    } else {
      onChange(compressedBase64);
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
