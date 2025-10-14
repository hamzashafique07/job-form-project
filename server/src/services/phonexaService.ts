//server/src/services/phonexaService.ts
/** @format */
import axios from "axios";
import { getSecretValue } from "../utils/secrets";
import { PHONEXA_URL } from "../config/env";

export async function postLeadToPhonexa(
  payload: Record<string, any>,
  creds: { apiId: string; apiPasswordKeyRef: string }
) {
  const password = await getSecretValue(creds.apiPasswordKeyRef);

  // merge credentials and fix ProductId key just in case
  const bodyToSend = {
    ProductId: payload.ProductId ?? payload.productId ?? 329,
    ...payload,
    apiId: creds.apiId,
    apiPassword: password,
  };

  console.log(
    "→ Sending payload to Phonexa:",
    JSON.stringify(bodyToSend, null, 2)
  );

  try {
    const res = await axios.post(PHONEXA_URL, bodyToSend, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    console.log("✅ Phonexa response:", res.data);
    return { status: "sent", data: res.data };
  } catch (err: any) {
    console.error("❌ Phonexa error:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
    if (err.response?.status >= 500)
      return { status: "queued", error: err.message };
    return {
      status: "failed",
      error: err.message,
      response: err.response?.data,
    };
  }
}
