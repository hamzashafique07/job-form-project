// server/src/utils/affId.ts
import { Types } from "mongoose";

export function getOrGenerateAffId(leadDoc: any, incomingAffId?: string) {
  // 1) if lead already has aff_id, keep it
  if (leadDoc?.aff_id) {
    return {
      affId: String(leadDoc.aff_id),
      affIdDefaulted: false,
      originalAffId: leadDoc.originalAffId || leadDoc.aff_id || null,
    };
  }

  // 2) if incoming aff id provided (from query or payload), use it
  if (incomingAffId) {
    return {
      affId: String(incomingAffId),
      affIdDefaulted: false,
      originalAffId: incomingAffId,
    };
  }

  // 3) fallback: attempt to use DEFAULT_AFF_ID env var; else generate a temp ObjectId string
  const DEFAULT_AFF_ID = process.env.DEFAULT_AFF_ID;
  if (DEFAULT_AFF_ID) {
    return {
      affId: String(DEFAULT_AFF_ID),
      affIdDefaulted: true,
      originalAffId: null,
    };
  }

  // generate a temp GUID-like id (use a Mongo ObjectId string)
  return {
    affId: new Types.ObjectId().toHexString(),
    affIdDefaulted: true,
    originalAffId: null,
  };
}
