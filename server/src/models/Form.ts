/** @format */

//server/src/models/Form.ts
import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    house: String,
    street: String,
    city: String,
    county: String,
    postcode: String,
  },
  { _id: false }
);

const ConsentSchema = new mongoose.Schema(
  {
    text: String,
    acceptedAt: Date,
    ip: String,
    userAgent: String,
  },
  { _id: false }
);

const ValidationStatusesSchema = new mongoose.Schema(
  {
    email: { providerResponse: mongoose.Schema.Types.Mixed },
    phone: { providerResponse: mongoose.Schema.Types.Mixed },
    addressLookup: { providerResponse: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const FormSchema = new mongoose.Schema(
  {
    aff_id: String,
    originalAffId: String,
    usedAffId: String,
    affIdDefaulted: { type: Boolean, default: false },
    iva: String,
    title: String,
    firstName: String,
    lastName: String,
    dob: Date,
    email: String,
    phone: String,
    consent: ConsentSchema,
    signatureFileUrl: String,
    signatureBase64: String,
    currentPostcode: String,
    currentAddress: AddressSchema,
    previousAddress: AddressSchema,
    validationStatuses: ValidationStatusesSchema,
    crmStatus: String,
    crmResponse: mongoose.Schema.Types.Mixed,
    apiCredentialsUsed: {
      apiId: String,
      apiPasswordKeyRef: String,
    },
    meta: {
      ip: String,
      userAgent: String,
      source: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Form", FormSchema);
