// shared/schemas.ts
/** @format */
import { z } from "zod";

/**
 * Shared Zod schemas for the project.
 * Each schema uses stable "error key" messages (e.g. 'firstName.minLength')
 * so server can map them to human strings.
 */

/* ---- Primitive / Field schemas ---- */

export const ivaSchema = z.enum(["Yes", "No"], {
  message: "iva.required",
});

export const titleSchema = z.enum(["Mr", "Mrs", "Miss", "Ms"], {
  message: "title.required",
});

export const nameSchema = z
  .string()
  .min(1, { message: "field.required" }) // empty -> generic required
  .min(2, { message: "firstName.minLength" }) // used for first/last
  .regex(/^[A-Za-z ]+$/, { message: "firstName.invalidChars" })
  .max(100, { message: "field.tooLong" });

export const lastNameSchema = z
  .string()
  .min(1, { message: "field.required" })
  .min(2, { message: "lastName.minLength" })
  .regex(/^[A-Za-z ]+$/, { message: "lastName.invalidChars" })
  .max(100, { message: "field.tooLong" });

export const dobSchema = z.preprocess(
  (val) => (val == null ? "" : val), // convert undefined/null → ""
  z
    .string()
    .min(1, { message: "dob.required" })
    .refine(
      (val: string) => {
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      { message: "dob.invalid" }
    )
    .refine(
      (val: string) => {
        const d = new Date(val);
        const minDob = new Date();
        minDob.setFullYear(minDob.getFullYear() - 18);
        return d <= minDob;
      },
      { message: "dob.underage" }
    )
);

export const emailSchema = z
  .string()
  .min(1, { message: "email.required" })
  .email({ message: "email.invalidFormat" });

export const phoneSchema = z.preprocess(
  (val) => (val == null ? "" : val), // convert undefined/null → ""
  z
    .string()
    .min(1, { message: "phone.required" })
    .regex(/^07\d{9}$/, { message: "phone.format" })
);

export const consentSchema = z
  .boolean()
  .refine((v: boolean) => v === true, { message: "consent.required" });

// portable: doesn't rely on required_error or default chaining
export const signatureBase64Schema = z
  .string()
  .optional()
  .transform((val) => val ?? "")
  .refine((val) => typeof val === "string" && val.length > 0, {
    message: "signature.required",
  });

export const currentPostcodeSchema = z
  .string()
  .min(1, { message: "currentPostcode.required" })
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/, {
    message: "currentPostcode.format",
  });

/* Address object used for current/previous addresses */
export const addressObjectSchema = z.object({
  house: z.string().min(1, { message: "address.field.required" }),
  street: z.string().min(1, { message: "address.field.required" }),
  city: z.string().min(1, { message: "address.field.required" }),
  county: z
    .string()
    .optional()
    .transform((val) => val ?? ""), // ✅ optional now

  district: z
    .string()
    .optional()
    .transform((val) => val ?? ""), // ✅ new safe optional field

  postcode: z.string().min(1, { message: "address.field.required" }),
});

/* ---- Higher-level / step schemas ---- */

/* Hello (single-field demonstration) */
export const helloSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "firstName.required" })
    .min(2, { message: "firstName.minLength" })
    .regex(/^[A-Za-z ]+$/, { message: "firstName.invalidChars" })
    .max(100, { message: "firstName.tooLong" }),
});

/* Personal details (core form) */
export const personalDetailsSchema = z.object({
  iva: ivaSchema,
  title: titleSchema,
  firstName: nameSchema.transform((s: string) => s.trim()),
  lastName: lastNameSchema.transform((s: string) => s.trim()),
  dob: dobSchema,
  email: emailSchema.transform((s: string) => s.toLowerCase()),
  phone: phoneSchema,
  consent: consentSchema,
  signatureBase64: signatureBase64Schema, // final submit requires this; optional for partial saves
  // currentPostcode: currentPostcodeSchema.optional(), // used in address lookup step
  // currentAddress: addressObjectSchema.optional(),
  // previousAddress: addressObjectSchema.optional(),
});

/* Address lookup step: only postcode required for lookup */
export const addressLookupSchema = z.object({
  currentPostcode: currentPostcodeSchema,
  currentAddress: addressObjectSchema.optional(),
  previousPostcode: currentPostcodeSchema.optional(),
  previousAddress: addressObjectSchema.optional(),
});

/* PostcodeSchema */
export const postcodeSchema = z.object({
  currentPostcode: currentPostcodeSchema,
});

/* Final submit schema — full validation (similar to personalDetails but signature required) */
export const finalSubmitSchema = personalDetailsSchema.extend({
  signatureBase64: signatureBase64Schema, // now required
  // Ensure addresses are included on final submit
  currentAddress: addressObjectSchema,
  previousAddress: addressObjectSchema.optional(),
});

/* ---- Utility: schema picker by stepId (centralised) ---- */

export function getSchemaForStep(stepId: string) {
  switch (stepId) {
    case "postcode":
      return postcodeSchema;
    case "hello":
      return helloSchema;
    case "personal-details":
      return personalDetailsSchema;
    case "address-lookup":
      return addressLookupSchema;
    case "submit":
    case "final":
      return finalSubmitSchema;
    default:
      return undefined;
  }
}

/* ---- Types exported for consuming projects (client/server) ---- */

export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type HelloData = z.infer<typeof helloSchema>;
export type AddressLookup = z.infer<typeof addressLookupSchema>;
export type FinalSubmit = z.infer<typeof finalSubmitSchema>;
export type PostcodeData = z.infer<typeof postcodeSchema>;

// Use union, not intersection
export type FormData =
  | HelloData
  | PersonalDetails
  | AddressLookup
  | FinalSubmit
  | PostcodeData;
