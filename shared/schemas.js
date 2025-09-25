/** @format */
// shared/schemas.ts
import { z } from "zod";
/**
 * Each Zod validation error message is set to a stable "error key"
 * (e.g. 'firstName.minLength') so the server can map it to the exact
 * human message texts in the backlog.
 */
/* Field schemas (with error-key messages) */
export const ivaSchema = z.enum(["Yes", "No"], {
    message: "iva.required",
});
export const titleSchema = z.enum(["Mr", "Mrs", "Miss", "Ms"], {
    message: "title.required",
});
export const nameSchema = z
    .string()
    .min(1, { message: "field.required" }) // for empty string -> generic required (can map to name-specific if needed)
    .min(2, { message: "firstName.minLength" }) // will be used for firstName/lastName specifically
    .regex(/^[A-Za-z ]+$/, { message: "firstName.invalidChars" })
    .max(100, { message: "field.tooLong" });
export const dobSchema = z
    .string()
    .min(1, { message: "dob.required" })
    .refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime());
}, { message: "dob.invalid" })
    .refine((val) => {
    const d = new Date(val);
    // robust: compute 18 years difference
    const minDob = new Date();
    minDob.setFullYear(minDob.getFullYear() - 18);
    return d <= minDob;
}, { message: "dob.underage" });
export const emailSchema = z
    .string()
    .min(1, { message: "email.required" })
    .email({ message: "email.invalidFormat" });
export const phoneSchema = z
    .string()
    .min(1, { message: "phone.required" })
    .regex(/^07\d{9}$/, { message: "phone.format" });
export const consentSchema = z
    .boolean()
    .refine((v) => v === true, { message: "consent.required" });
export const signatureBase64Schema = z
    .string()
    .min(1, { message: "signature.required" });
export const currentPostcodeSchema = z
    .string()
    .min(1, { message: "currentPostcode.required" })
    .regex(/^\d{5,7}$/, { message: "currentPostcode.format" });
export const addressObjectSchema = z.object({
    house: z.string().min(1, { message: "address.field.required" }),
    street: z.string().min(1, { message: "address.field.required" }),
    city: z.string().min(1, { message: "address.field.required" }),
    county: z.string().min(1, { message: "address.field.required" }),
    postcode: z.string().min(1, { message: "address.field.required" }),
});
/* Full personal details schema (used later). For Phase 1 we will call getSchemaForStep('hello') */
export const personalDetailsSchema = z.object({
    iva: ivaSchema,
    title: titleSchema,
    firstName: nameSchema.transform((s) => s.trim()),
    lastName: nameSchema.transform((s) => s.trim()),
    dob: dobSchema,
    email: emailSchema.transform((s) => s.toLowerCase()),
    phone: phoneSchema,
    consent: consentSchema,
    signatureBase64: signatureBase64Schema,
    currentPostcode: currentPostcodeSchema,
    currentAddress: addressObjectSchema.optional(),
    previousAddress: addressObjectSchema.optional(),
});
/* Hello (minimal) schema for the HelloForm demo — single field example */
export const helloSchema = z.object({
    firstName: z
        .string()
        .min(1, { message: "firstName.required" })
        .min(2, { message: "firstName.minLength" })
        .regex(/^[A-Za-z ]+$/, { message: "firstName.invalidChars" })
        .max(100, { message: "firstName.tooLong" }),
});
/* Export a helper: pick schema by stepId */
export function getSchemaForStep(stepId) {
    switch (stepId) {
        case "hello":
            return helloSchema;
        case "personal-details":
            return personalDetailsSchema;
        default:
            return undefined;
    }
}
