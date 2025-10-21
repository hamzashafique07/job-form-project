//client/src/components/form/PersonalDetailsForm.tsx
/** @format */
import TextInput from "../ui/TextInput";
import React from "react";
import SignatureCanvas from "../ui/SignatureCanvas";
import { useFormContext } from "react-hook-form";
import DatePicker from "react-datepicker";
import { useState } from "react";
import { format } from "date-fns";

type Props = {
  register: any;
  errors: Record<string, any>;
  setValue: (name: string, value: any, opts?: any) => void;
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
  // ✅ Must be INSIDE the component
  const { watch, trigger } = useFormContext();
  const [dob, setDob] = useState<Date | null>(null);

  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <>
      {/* IVA */}
      <div className="mb-4">
        <label className="block font-medium">
          Have you been in an IVA or bankruptcy?
        </label>
        <div className="flex gap-4 mt-2">
          <label>
            <input type="radio" value="Yes" {...register("iva")} />{" "}
            <span className="ml-1">Yes</span>
          </label>
          <label>
            <input type="radio" value="No" {...register("iva")} />{" "}
            <span className="ml-1">No</span>
          </label>
        </div>
        {errors.iva && (
          <p className="text-red-600 mt-1">{errors.iva.message}</p>
        )}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block font-medium">Title</label>
        <div className="flex gap-4 mt-2">
          {["Mr", "Mrs", "Miss", "Ms"].map((t) => (
            <label key={t}>
              <input type="radio" value={t} {...register("title")} />{" "}
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
        {...register("firstName")}
        value={watch("firstName") || ""}
        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
          const clean = e.target.value.replace(/[^A-Za-z\s]/g, "");
          setValue("firstName", clean, {
            shouldValidate: false,
            shouldDirty: true,
          });

          // ✅ Instantly clear error if name length ≥ 2
          if (clean.trim().length >= 2 && errors.firstName) {
            await trigger("firstName");
          }
        }}
        onBlur={async (e) => {
          const clean = toTitleCase(e.target.value.trim());
          setValue("firstName", clean, {
            shouldValidate: true,
            shouldDirty: true,
          });
          await trigger("firstName");
        }}
        error={errors.firstName?.message}
      />

      {/* Last Name */}
      <TextInput
        label="Last name"
        placeholder="Enter last name"
        {...register("lastName")}
        value={watch("lastName") || ""}
        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
          const clean = e.target.value.replace(/[^A-Za-z\s]/g, "");
          setValue("lastName", clean, {
            shouldValidate: false,
            shouldDirty: true,
          });

          // ✅ Instantly clear error if name length ≥ 2
          if (clean.trim().length >= 2 && errors.lastName) {
            await trigger("lastName");
          }
        }}
        onBlur={async (e) => {
          const clean = toTitleCase(e.target.value.trim());
          setValue("lastName", clean, {
            shouldValidate: true,
            shouldDirty: true,
          });
          await trigger("lastName");
        }}
        error={errors.lastName?.message}
      />

      {/* DOB */}
      {/* DOB - React DatePicker, but compatible with your old string-based logic */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Date of birth</label>
        <DatePicker
          selected={
            watch("dob") ? new Date(watch("dob")) : null // ensure proper Date value
          }
          onChange={(date: Date | null) => {
            // Always send a string (not undefined!)
            const formatted = date ? format(date, "yyyy-MM-dd") : "";
            setValue("dob", formatted, {
              shouldValidate: true,
              shouldDirty: true,
            });
            trigger("dob"); // re-run validation instantly
          }}
          dateFormat="dd/MM/yyyy"
          placeholderText="Click to select your date of birth"
          maxDate={new Date(maxDob)}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.dob && (
          <p className="text-red-600 mt-1">{errors.dob.message}</p>
        )}
      </div>

      {/* Email */}
      <TextInput
        label="Email"
        type="email"
        placeholder="example@domain.com"
        {...register("email")}
        value={watch("email") || ""}
        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
          const clean = e.target.value.trim().toLowerCase();
          setValue("email", clean, {
            shouldValidate: false,
            shouldDirty: true,
          });

          // ✅ If user types a valid email format, instantly clear error
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(clean)) {
            await trigger("email"); // revalidate to clear any existing error
          }
        }}
        onBlur={async (e) => {
          const clean = e.target.value.trim().toLowerCase();
          // ✅ Validate when user finishes typing (on blur)
          setValue("email", clean, { shouldValidate: true, shouldDirty: true });
          await trigger("email");
        }}
        error={errors.email?.message}
      />

      {/* ✅ Phone */}
      <TextInput
        label="Phone"
        type="tel"
        placeholder="07123 456789"
        inputMode="numeric"
        maxLength={11}
        value={watch("phone") || ""}
        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
          const raw = e.target.value ?? "";
          const clean = raw.replace(/\D/g, "").slice(0, 11);

          // Default: no validation yet
          let shouldValidate = false;

          // Step-by-step check:
          if (clean.length === 0) {
            shouldValidate = false;
          } else if (clean.length === 1) {
            shouldValidate = clean[0] !== "0"; // only show if first isn't 0
          } else if (clean.length >= 2) {
            const prefix = clean.slice(0, 2);
            shouldValidate = prefix !== "07"; // only show if first two not "07"
          }

          // ✅ Always update the field
          setValue("phone", clean, { shouldValidate, shouldDirty: true });

          // ✅ LIVE validation: when 11 digits & starts with 07, clear error instantly
          if (clean.length === 11 && clean.startsWith("07")) {
            await trigger("phone");
          } else if (errors.phone) {
            // Force revalidate progressively if error exists
            await trigger("phone");
          }
        }}
        onBlur={() => {
          const phoneValue = watch("phone");
          setValue("phone", phoneValue ?? "", { shouldValidate: true });
          trigger("phone");
        }}
        error={errors.phone?.message}
      />

      {/* Consent */}
      <div className="mt-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("consent")} />
          <span>I consent to the terms and conditions</span>
        </label>
        {errors.consent && (
          <p className="text-red-600 mt-1">{errors.consent.message}</p>
        )}
      </div>

      {/* Signature */}
      <SignatureCanvas
        value={undefined}
        onChange={(base64) =>
          setValue("signatureBase64", base64, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={errors.signatureBase64?.message}
      />
    </>
  );
}
