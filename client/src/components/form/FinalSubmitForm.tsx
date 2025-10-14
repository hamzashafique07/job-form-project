import { useState } from "react";
import TextInput from "../ui/TextInput";

type Props = {
  register: any;
  errors: Record<string, any>;
};

export default function FinalSubmitForm({ register, errors }: Props) {
  const [preview, setPreview] = useState("");

  const resizeBase64 = (base64Str: string, maxSize = 90) =>
    new Promise<string>((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
    });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith("data:image/")) {
      const resized = await resizeBase64(value);
      setPreview(resized);
      e.target.value = resized; // replace with smaller image
    }
  };

  return (
    <div>
      <TextInput
        label="Signature (Base64)"
        placeholder="Paste signature"
        {...register("signatureBase64")}
        error={errors.signatureBase64?.message}
        onChange={handleChange}
      />
      {preview && (
        <img
          src={preview}
          alt="Signature Preview"
          className="mt-2 w-[90px] h-[90px] border rounded"
        />
      )}
    </div>
  );
}
