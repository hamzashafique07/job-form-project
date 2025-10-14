// server/src/utils/buildPhonexaPayload.ts
import { parseDOB, formatDOB } from "./dateUtils.js";
import { getApiCredentials } from "./apiCredentials.js";
import { parseUserAgent } from "./parseUserAgent.js";

/**
 * Helper: Flatten nested lead structure so all key fields are top-level
 */
function flattenLead(leadDoc: any) {
  const flat: any = { ...leadDoc };

  // If the caller passed the whole Mongoose form doc (with steps), merge known steps
  if (leadDoc.steps?.addressLookup) {
    const addr = leadDoc.steps.addressLookup;
    flat.currentAddress = addr.currentAddress;
    flat.previousAddress = addr.previousAddress;
    flat.currentPostcode = addr.currentPostcode;
    flat.previousPostcode = addr.previousPostcode;
  }

  if (leadDoc.steps?.personalDetails) {
    Object.assign(flat, leadDoc.steps.personalDetails);
  }

  if (leadDoc.steps?.final) {
    Object.assign(flat, leadDoc.steps.final);
  }

  return flat;
}

/**
 * Build the exact payload to send to Phonexa with flat, CRM-friendly field names.
 *
 * - rawLead: either a flattened lead or the full Form doc (we handle both)
 * - userIp: ip string from request
 * - affId: affiliate id used for credentials & tracking
 */
export function buildPhonexaPayload(rawLead: any, userIp: string, affId: any) {
  const leadDoc = flattenLead(rawLead);

  // DOB parsing & formatting
  const dobSource = leadDoc.dateOfBirth || leadDoc.dob || leadDoc.DOB || "";
  const dobParts = parseDOB(dobSource);
  const dobFormatted = formatDOB(dobSource); // DD/MM/YYYY

  // addresses with fallbacks
  const current =
    leadDoc.currentAddress || leadDoc.current_address || leadDoc.current || {};
  const previous =
    leadDoc.previousAddress ||
    leadDoc.previous_address ||
    leadDoc.previous ||
    {};

  const fullCurrent = [
    current.house || current.houseNo || "",
    current.street || current.address1 || "",
    current.city || "",
    current.postcode || current.postCode || "",
  ]
    .filter(Boolean)
    .join(", ");

  const fullPrevious = [
    previous.house || previous.houseNo || "",
    previous.street || previous.address1 || "",
    previous.city || "",
    previous.postcode || previous.postCode || "",
  ]
    .filter(Boolean)
    .join(", ");

  // userAgent parsing (fills userBrowser/userDevice/userOs if missing)
  const uaString =
    leadDoc.userAgent ||
    leadDoc.meta?.userAgent ||
    (typeof leadDoc.meta === "object" && leadDoc.meta.userAgent) ||
    "";
  const uaInfo = uaString
    ? parseUserAgent(uaString)
    : { browser: "", os: "", device: "" };

  // credentials (we include apiId here; phonexaService will attach resolved apiPassword at send time)
  const creds = getApiCredentials(affId);

  // Build and return payload using exact field names expected in Phonexa UI / mapping
  return {
    // product id (include both forms just to be safe)
    ProductId: 329,
    productId: 329,
    price: 0,

    // credentials (apiPassword will be replaced/resolved by phonexaService using secrets)
    apiId: creds?.apiId || "",
    apiPassword: creds?.apiPassword || "",

    // Primary identity & contact (order mirrors the CRM view you shared)
    email: leadDoc.email || leadDoc.Email || "",
    phoneNumber: leadDoc.phone || leadDoc.phoneNumber || leadDoc.Phone || "",
    title: leadDoc.title || "",
    firstName: leadDoc.firstName || leadDoc.firstname || "",
    lastName: leadDoc.lastName || leadDoc.lastname || "",

    // Current address (flat)
    houseNo:
      current.house ||
      current.houseNo ||
      current.houseNumber ||
      leadDoc.houseNo ||
      "",
    address1: current.street || current.address1 || leadDoc.address1 || "",
    postCode:
      current.postcode ||
      current.postCode ||
      leadDoc.postCode ||
      leadDoc.postcode ||
      "",
    city: current.city || leadDoc.city || "",
    county: current.county || leadDoc.county || "",

    // DOB: include both ISO-ish (dateOfBirth) and DD/MM/YYYY (dob) plus parts
    dateOfBirth: dobSource || "",
    dob: dobFormatted || "",
    dob_day: dobParts.day || "",
    dob_month: dobParts.month || "",
    dob_year: dobParts.year || "",

    // Financial / extras
    creditReportPdf: leadDoc.creditReportPdf || "Not Found",

    // Signature
    signature: leadDoc.signatureBase64 || leadDoc.signature || "",
    signatureFileUrl: leadDoc.signatureFileUrl || "",

    // previous address granular fields (often expected by CRM)
    prev_address1: previous.street || previous.address1 || "",
    prev_address_city: previous.city || "",
    prev_address_county: previous.county || "",
    prev_address_postcode: previous.postcode || previous.postCode || "",
    prev_houseNo: previous.house || previous.houseNo || "",

    // full address strings
    fullAddressCurrent: fullCurrent || leadDoc.fullAddressCurrent || "",
    fullAddressPrevious: fullPrevious || leadDoc.fullAddressPrevious || "",

    // Agent / lead metadata (user ip + user agent details)
    userIp: userIp || leadDoc.userIp || leadDoc.meta?.ip || "",
    userAgent: uaString || leadDoc.userAgent || "",
    userBrowser: leadDoc.userBrowser || uaInfo.browser || "",
    userDevice: leadDoc.userDevice || uaInfo.device || "",
    userOs: leadDoc.userOs || uaInfo.os || "",

    // Stl/tracking/aff fields
    stlLeadId: leadDoc.stlLeadId || leadDoc.stl_lead_id || "",
    buyer: leadDoc.buyer || "CLAIM3000",
    optinurl: leadDoc.optinurl || leadDoc.optinUrl || "",
    fullUrl: leadDoc.fullUrl || "",
    referral: leadDoc.referral || "",
    partner_tracking_id:
      leadDoc.partner_tracking_id ||
      leadDoc.partnerTrackingId ||
      leadDoc.source ||
      "",

    // affiliate
    aff_id: String(affId || leadDoc.aff_id || ""),

    // Keep original raw validation/status data if helpful for debugging — not required by CRM mapping
    // (You can remove these if you don't want them sent)
    validationStatuses: undefined,
    meta: undefined,
  };
}
