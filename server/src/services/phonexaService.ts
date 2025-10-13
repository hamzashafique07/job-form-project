// server/src/services/phonexaService.ts
/** @format */
import axios from "axios";
import { getSecretValue } from "../utils/secrets";
import { PHONEXA_URL } from "../config/env";

export async function postLeadToPhonexa(
  payload: Record<string, any>,
  creds: { apiId: string; apiPasswordKeyRef: string }
) {
  const password = await getSecretValue(creds.apiPasswordKeyRef);
  const auth = { username: creds.apiId, password };

  try {
    const res = await axios.post(PHONEXA_URL, payload, {
      auth,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });
    return { status: "sent", data: res.data };
  } catch (err: any) {
    console.error("Phonexa error:", err.message);
    if (err.response?.status >= 500)
      return { status: "queued", error: err.message };
    return { status: "failed", error: err.message };
  }
}
