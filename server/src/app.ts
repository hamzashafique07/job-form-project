/** @format */
// server/src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import healthRoutes from "./routes/healthRoute";
import { formRoute } from "./routes/formRoute";
import addressRoutes from "./routes/address";
import uploadRoute from "./routes/uploadRoute";

// 🆕 Add import for default aff check
import { ensureDefaultAffPresentOrFail } from "./services/affCredentialsService";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is required in .env");
  process.exit(1);
}

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/health", healthRoutes);
app.use("/api/forms", formRoute);
app.use("/api/address", addressRoutes);
app.use("/api/upload", uploadRoute);

export async function initApp() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // 🩵 --- PATCH START: ensure DEFAULT_AFF_ID exists ---
    try {
      await ensureDefaultAffPresentOrFail();
      console.log(
        "✅ DEFAULT_AFF_ID present in aff_credentials collection (or not configured)."
      );
    } catch (err) {
      console.error("❌ Aff credentials check failed:", err);
      process.exit(1);
    }
    // 🩵 --- PATCH END ---
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }

  return app;
}
