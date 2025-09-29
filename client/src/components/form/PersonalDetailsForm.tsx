// client/src/components/form/PersonalDetailsForm.tsx
/** @format */
import TextInput from "../ui/TextInput";
import React from "react";

type Props = {
  register: any;
  errors: Record<string, any>;
  setValue: (name: string, value: any, opts?: any) => void; // ✅ allow setValue
};

function toTitleCase(s: string) {
  return s
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default function PersonalDetailsForm({
  register,
  errors,
  setValue,
}: Props) {
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  })();

  const firstReg = register("firstName");
  const lastReg = register("lastName");
  const emailReg = register("email");
  const dobReg = register("dob");
  const phoneReg = register("phone");
  const ivaReg = register("iva");
  const titleReg = register("title");
  const consentReg = register("consent");

  const handleFirstBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = (e.target.value || "").trim();
    const tc = toTitleCase(v);
    setValue("firstName", tc, { shouldValidate: true, shouldDirty: true });
    firstReg.onBlur && firstReg.onBlur(e);
  };

  const handleLastBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = (e.target.value || "").trim();
    const tc = toTitleCase(v);
    setValue("lastName", tc, { shouldValidate: true, shouldDirty: true });
    lastReg.onBlur && lastReg.onBlur(e);
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = (e.target.value || "").trim().toLowerCase();
    setValue("email", v, { shouldValidate: true, shouldDirty: true });
    emailReg.onBlur && emailReg.onBlur(e);
  };

  return (
    <>
      {/* IVA */}
      <div className="mb-4">
        <label className="block font-medium">
          Have you been in an IVA or bankruptcy?
        </label>
        <div className="flex gap-4 mt-2">
          <label>
            <input type="radio" value="Yes" {...ivaReg} />{" "}
            <span className="ml-1">Yes</span>
          </label>
          <label>
            <input type="radio" value="No" {...ivaReg} />{" "}
            <span className="ml-1">No</span>
          </label>
        </div>
        {errors.iva && <p className="text-red-600 mt-1">{errors.iva.message}</p>}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block font-medium">Title</label>
        <div className="flex gap-4 mt-2">
          {["Mr", "Mrs", "Miss", "Ms"].map((t) => (
            <label key={t}>
              <input type="radio" value={t} {...titleReg} />{" "}
              <span className="ml-1">{t}</span>
            </label>
          ))}
        </div>
        {errors.title && (
          <p className="text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* First Name */}
      <TextInput
        label="First name"
        placeholder="Enter first name"
        {...firstReg}
        onBlur={handleFirstBlur}
        error={errors.firstName?.message}
      />

      {/* Last Name */}
      <TextInput
        label="Last name"
        placeholder="Enter last name"
        {...lastReg}
        onBlur={handleLastBlur}
        error={errors.lastName?.message}
      />

      {/* DOB */}
      <TextInput
        label="Date of birth"
        type="date"
        max={maxDob}
        {...dobReg}
        error={errors.dob?.message}
      />

      {/* Email */}
      <TextInput
        label="Email"
        type="email"
        placeholder="example@domain.com"
        {...emailReg}
        onBlur={handleEmailBlur}
        error={errors.email?.message}
      />

      {/* Phone */}
      <TextInput
        label="Phone"
        type="tel"
        placeholder="07123 456789"
        inputMode="tel"
        pattern="^07\\d{9}$"
        {...phoneReg}
        error={errors.phone?.message}
      />

      {/* Consent */}
      <div className="mt-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...consentReg} />
          <span>I consent to the terms and conditions</span>
        </label>
        {errors.consent && (
          <p className="text-red-600 mt-1">{errors.consent.message}</p>
        )}
      </div>
    </>
  );
}
