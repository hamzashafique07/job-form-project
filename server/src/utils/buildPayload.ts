//servr/src/utils/buildPayload.ts
import { parseDOB } from "./dateUtils.js";
import { getApiCredentials } from "./apiCredentials.js";

export function buildPhonexaPayload(leadDoc, userIp, affId) {
  const dobInfo = parseDOB(leadDoc.dob);
  const creds = getApiCredentials(affId);
  const trackingId =
    affId === 666
      ? "CLAIM3000"
      : affId === 673
      ? "ML"
      : leadDoc.meta?.source || "";

  return {
    productId: 329,
    price: 0,
    postCode: leadDoc.currentAddress?.postCode || "",
    firstName: leadDoc.firstName,
    lastName: leadDoc.lastName,
    email: leadDoc.email,
    iva: leadDoc.iva || "",
    phoneNumber: leadDoc.phone,
    address1: leadDoc.currentAddress?.street || "",
    fullAddressPrevious: leadDoc.previousAddress?.fullAddressPrevious || "",
    fullAddressCurrent: leadDoc.currentAddress?.fullAddressCurrent || "",
    houseNo: leadDoc.currentAddress?.houseNumber || "",
    city: leadDoc.currentAddress?.postTown || "",
    county: leadDoc.currentAddress?.county || "",
    title: leadDoc.title,
    signatureFileUrl: leadDoc.signatureFileUrl,
    signature: leadDoc.signatureBase64,
    dateOfBirth: leadDoc.dob || "",
    dob_day: dobInfo.day,
    dob_month: dobInfo.month,
    dob_year: dobInfo.year,
    userIp,
    userAgent: leadDoc.meta?.userAgent || "",
    buyer: "CLAIM3000",
    aff_id: affId,
    ...creds,
  };
}
