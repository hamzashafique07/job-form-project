// server/src/lib/phonexaMapper.ts
import type { FinalSubmit } from "@job-form/shared/schemas";

/**
 * Map internal form + form-level metadata -> exact Phonexa payload keys (case-sensitive).
 *
 * Accepts:
 *  - data: partial final submit / leadDoc (addresses, personal fields, signature)
 *  - meta: extra info (aff_id, apiId, userIp, userAgent, createdAt, updatedAt, signatureTime, landingTime, submissionTime, stlLeadId, optinurl, buyer)
 *
 * Returns object ready to POST to Phonexa (phonexaService will attach apiPassword).
 */
export function mapToPhonexaPayload(
  data: Partial<FinalSubmit> & Record<string, any>,
  meta: Record<string, any> = {}
) {
  // Address fallback types (include optional alternate keys commonly used)
  type AddressLike = {
    house?: string;
    street?: string;
    address1?: string;
    address2?: string;
    line2?: string;
    city?: string;
    county?: string;
    postcode?: string;
  };

  const current = (data.currentAddress ?? {
    house: "",
    street: "",
    address1: "",
    address2: "",
    line2: "",
    city: "",
    county: "",
    postcode: "",
  }) as AddressLike;

  const previous = (data.previousAddress ?? {
    house: "",
    street: "",
    address1: "",
    address2: "",
    line2: "",
    city: "",
    county: "",
    postcode: "",
  }) as AddressLike;

  // Helper date formatting: convert incoming dob to both iso-ish and DD/MM/YYYY
  function formatDob(raw?: string | Date) {
    if (!raw) return { dateOfBirth: "", dob: "", day: "", month: "", year: "" };
    const d = raw instanceof Date ? raw : new Date(raw);
    if (Number.isNaN(d.getTime()))
      return { dateOfBirth: "", dob: "", day: "", month: "", year: "" };

    const iso = d.toISOString().split("T")[0]; // YYYY-MM-DD
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    const ddmmyy = `${dd}/${mm}/${yyyy}`; // 10/06/1976 style

    return { dateOfBirth: iso, dob: ddmmyy, day: dd, month: mm, year: yyyy };
  }

  const dobInfo = formatDob(data.dob || meta.dob || data.dateOfBirth || "");

  // Build fullAddress strings
  const fullAddressCurrent = [
    current.house || "",
    current.street || "",
    current.city || "",
    current.county || "",
    current.postcode || meta.postCode || meta.currentPostcode || "",
  ]
    .filter(Boolean)
    .join(", ");

  const fullAddressPrevious = [
    previous.house || "",
    previous.street || "",
    previous.city || "",
    previous.county || "",
    previous.postcode || meta.prev_address_postcode || "",
  ]
    .filter(Boolean)
    .join(", ");

  // Timestamps - meta may pass createdAt/updatedAt/signatureTime in Date or ISO string
  function fmtTimestamp(t?: string | Date) {
    if (!t) return "";
    const d = t instanceof Date ? t : new Date(t);
    if (Number.isNaN(d.getTime())) return "";
    // Example Phonexa sample: "04/09/2025 11:46:39 UTC+01"
    // We'll send UTC-ish 'DD/MM/YYYY HH:mm:ss UTC±HH' using timezone offset
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    const tzOffset = -d.getTimezoneOffset(); // minutes east of UTC
    const tzSign = tzOffset >= 0 ? "+" : "-";
    const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(
      2,
      "0"
    );
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss} UTC${tzSign}${tzHours}`;
  }

  const payload: Record<string, any> = {
    // credentials / product - phonexaService will attach apiPassword, but include apiId/productId if provided
    apiId: meta.apiId ?? data.apiId ?? "",
    productId: meta.productId ?? data.productId ?? meta.ProductId ?? 329,
    price: meta.price ?? data.price ?? 0,

    // Primary identity
    email: data.email ?? "",
    phoneNumber: data.phone ?? data.phoneNumber ?? "",
    title: data.title ?? "",
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",

    // Landline optional
    landline: data.landline ?? "",

    // Current address (Phonexa expects capital C: postCode)
    houseNo: current.house ?? "",
    address1: current.street ?? current.address1 ?? "",
    address2: current.line2 ?? current.address2 ?? "",
    city: current.city ?? "",
    county: current.county ?? "",
    postCode: current.postcode ?? meta.postCode ?? data.postCode ?? "",

    // DOBs
    dateOfBirth: dobInfo.dateOfBirth, // ISO-ish YYYY-MM-DD
    dob: dobInfo.dob, // DD/MM/YYYY
    dob_day: dobInfo.day,
    dob_month: dobInfo.month,
    dob_year: dobInfo.year,

    // Credit & signature
    creditReportPdf: data.creditReportPdf ?? "Not Found",
    signature: (data.signatureBase64 ?? data.signature) as string,
    signatureFileUrl: meta.signatureFileUrl ?? data.signatureFileUrl ?? "",

    // Metadata / tracking
    userBrowser: data.userBrowser ?? meta.userBrowser ?? "",
    userDevice: data.userDevice ?? meta.userDevice ?? "",
    userOs: data.userOs ?? meta.userOs ?? "",
    userAgent: meta.userAgent ?? data.userAgent ?? "",
    userIp: meta.userIp ?? data.userIp ?? "",

    // IVA / AFF
    iva: data.iva ?? meta.iva ?? "",
    aff_id: String(meta.aff_id ?? data.aff_id ?? ""),

    // Full addresses
    fullAddressCurrent:
      meta.fullAddressCurrent ?? data.fullAddressCurrent ?? fullAddressCurrent,
    fullAddressPrevious:
      meta.fullAddressPrevious ??
      data.fullAddressPrevious ??
      fullAddressPrevious,

    // previous address granular
    prev_address1: previous.street ?? previous.address1 ?? "",
    prev_address2: previous.line2 ?? previous.address2 ?? "",
    prev_address_city: previous.city ?? "",
    prev_address_county: previous.county ?? "",
    prev_address_postcode:
      previous.postcode ?? meta.prev_address_postcode ?? "",
    prev_house_no: previous.house ?? "",

    // timestamps
    landingTime:
      meta.landingTime ?? fmtTimestamp(meta.createdAt ?? meta.landingTime),
    signatureTime:
      meta.signatureTime ??
      fmtTimestamp(meta.signatureTime ?? meta.createdAt ?? ""),
    submissionTime:
      meta.submissionTime ??
      fmtTimestamp(meta.submissionTime ?? meta.updatedAt ?? ""),

    // optional / extra
    stlLeadId: meta.stlLeadId ?? data.stlLeadId ?? "",
    buyer: meta.buyer ?? data.buyer ?? "NAASS",
    optinurl: meta.optinurl ?? data.optinurl ?? "",
    partner_tracking_id:
      meta.partner_tracking_id ?? data.partner_tracking_id ?? "",
    transaction_id:
      meta.transaction_id ??
      data.transaction_id ??
      String(meta.transaction_id ?? data.transaction_id ?? ""),
    // keep spare fields or tPar entries if present
    ...meta.extraSpare,
  };

  return payload;
}
