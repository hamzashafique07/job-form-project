//server/src/config/env.ts
/** @format */
import dotenv from "dotenv";
dotenv.config();

export const PHONEXA_URL =
  process.env.PHONEXA_URL || "https://leads-inst47-client.phonexa.uk/lead/";

export const DEFAULT_AFF_ID = process.env.DEFAULT_AFF_ID || "639";
