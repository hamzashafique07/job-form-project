// server/src/models/AffCredential.ts
import mongoose from "mongoose";

const AffCredentialSchema = new mongoose.Schema(
  {
    affId: { type: String, required: true, unique: true }, // e.g. "638"
    apiId: { type: String, required: true }, // username/client id
    apiPasswordKeyRef: { type: String, required: true }, // pointer to secret manager (do NOT store plaintext)
    meta: {
      note: String,
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "AffCredential",
  AffCredentialSchema,
  "aff_credentials"
);
