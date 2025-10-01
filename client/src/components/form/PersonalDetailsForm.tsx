//client/src/components/form/PersonalDetailsForm.tsx
/** @format */
import TextInput from "../ui/TextInput";
import React from "react";

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
        onBlur={(e) =>
          setValue("firstName", toTitleCase(e.target.value.trim()), {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={errors.firstName?.message}
      />

      {/* Last Name */}
      <TextInput
        label="Last name"
        placeholder="Enter last name"
        {...register("lastName")}
        onBlur={(e) =>
          setValue("lastName", toTitleCase(e.target.value.trim()), {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={errors.lastName?.message}
      />

      {/* DOB */}
      <TextInput
        label="Date of birth"
        type="date"
        max={maxDob}
        {...register("dob")}
        error={errors.dob?.message}
      />

      {/* Email */}
      <TextInput
        label="Email"
        type="email"
        placeholder="example@domain.com"
        {...register("email")}
        onBlur={(e) =>
          setValue("email", e.target.value.trim().toLowerCase(), {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={errors.email?.message}
      />

      {/* Phone */}
      <TextInput
        label="Phone"
        type="tel"
        placeholder="07123 456789"
        inputMode="numeric"
        maxLength={11}
        {...register("phone")}
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
          const clean = e.currentTarget.value.replace(/\D/g, "").slice(0, 11);
          setValue("phone", clean, { shouldValidate: true, shouldDirty: true });
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
    </>
  );
}
