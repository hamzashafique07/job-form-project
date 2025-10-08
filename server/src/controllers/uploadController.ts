//server/src/controllers/uploadController.ts
/** @format */
import { Request, Response } from "express";
import { uploadSignatureToDrive } from "../services/googleDriveService";
import Form from "../models/Form";

export async function uploadSignature(req: Request, res: Response) {
  try {
    const { signatureBase64, formId } = req.body;

    if (!signatureBase64) {
      return res.status(400).json({ error: "signatureBase64 required" });
    }

    const fileName = `signature_${formId || "unknown"}_${Date.now()}.png`;

    // 1️⃣ Upload to Google Drive
    const fileUrl = await uploadSignatureToDrive(signatureBase64, fileName);

    // 2️⃣ Save inside "final" section of Form document
    if (formId) {
      // Build query properly depending on type
      const query =
        formId.match(/^[0-9a-fA-F]{24}$/) !== null
          ? { _id: formId }
          : { formId };

      await Form.updateOne(
        query,
        {
          $set: {
            "final.signatureFileUrl": fileUrl,
            "final.signatureBase64": signatureBase64,
          },
        },
        { upsert: true }
      );
    } else {
      console.warn(`⚠️ Missing formId, skipping DB update`);
    }

    // 3️⃣ Respond to client
    return res.json({ success: true, fileUrl });
  } catch (err: any) {
    console.error("uploadSignature error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
