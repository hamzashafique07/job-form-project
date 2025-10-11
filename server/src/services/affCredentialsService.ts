// server/src/services/affCredentialsService.ts
import AffCredential from "../models/AffCredential";

export type AffCredentialsResult = {
  apiId: string | null;
  apiPasswordKeyRef: string | null;
  usedAffId: string;
  originalAffId?: string | null;
  affIdDefaulted: boolean;
};

export async function getCredentialsForAffId(
  incomingAffId?: string,
  fallbackAffId?: string
): Promise<AffCredentialsResult> {
  // Attempt to find exact match
  let usedAffId = incomingAffId || fallbackAffId || process.env.DEFAULT_AFF_ID;
  let affIdDefaulted = false;
  let originalAffId = incomingAffId || null;

  if (!usedAffId) {
    // if no configured default, leave usedAffId undefined — caller can decide
    usedAffId = "";
    affIdDefaulted = true;
  }

  // Try find by affId
  if (usedAffId) {
    const cred = await AffCredential.findOne({
      affId: String(usedAffId),
    }).lean();
    if (cred) {
      return {
        apiId: cred.apiId,
        apiPasswordKeyRef: cred.apiPasswordKeyRef,
        usedAffId: String(usedAffId),
        originalAffId: originalAffId,
        affIdDefaulted,
      };
    }
  }

  // Not found: attempt fallback DEFAULT_AFF_ID if it wasn't used
  const defaultAffId = process.env.DEFAULT_AFF_ID;
  if (defaultAffId && defaultAffId !== usedAffId) {
    const cred = await AffCredential.findOne({
      affId: String(defaultAffId),
    }).lean();
    if (cred) {
      return {
        apiId: cred.apiId,
        apiPasswordKeyRef: cred.apiPasswordKeyRef,
        usedAffId: String(defaultAffId),
        originalAffId: originalAffId,
        affIdDefaulted: true,
      };
    }
  }

  // Last resort: return empty creds (caller should handle)
  return {
    apiId: null,
    apiPasswordKeyRef: null,
    usedAffId: usedAffId || "",
    originalAffId: originalAffId,
    affIdDefaulted: !Boolean(usedAffId),
  };
}

/**
 * Optional helper called on startup to ensure DEFAULT_AFF_ID exists in DB.
 * Throw error if missing (fail-fast).
 */
export async function ensureDefaultAffPresentOrFail() {
  const defaultAffId = process.env.DEFAULT_AFF_ID;
  if (!defaultAffId) {
    console.warn(
      "DEFAULT_AFF_ID not set — continuing but aff credentials lookups may fail."
    );
    return;
  }
  const found = await AffCredential.findOne({
    affId: String(defaultAffId),
  }).lean();
  if (!found) {
    throw new Error(
      `DEFAULT_AFF_ID=${defaultAffId} not found in aff_credentials collection. Add an AffCredential for that affId or set DEFAULT_AFF_ID to a valid affId.`
    );
  }
}
