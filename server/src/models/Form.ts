// server/src/models/Form.ts
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
    // keep affiliate & meta fields
    aff_id: String,
    originalAffId: String,
    usedAffId: String,
    affIdDefaulted: { type: Boolean, default: false },

    // ✅ step-based storage
    steps: {
      hello: {
        firstName: String,
      },
      personalDetails: {
        iva: String,
        title: String,
        firstName: String,
        lastName: String,
        dob: Date,
        email: String,
        phone: String,
        consent: ConsentSchema,
      },
      addressLookup: {
        currentPostcode: String,
        currentAddress: AddressSchema,
        previousPostcode: String,
        previousAddress: AddressSchema,
      },
    },

    // ✅ final submission (signature + consolidated data)
    final: {
      signatureFileUrl: String,
      signatureBase64: String,
    },

    // validation / crm
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
