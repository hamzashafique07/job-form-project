// server/src/controllers/formController.ts
import { Request, Response } from "express";
import { z } from "zod";
import { getSchemaForStep } from "@job-form/shared/schemas";
import Form from "../models/Form";
import { mapStepId } from "../utils/stepIdMapper";
import { getOrGenerateAffId } from "../utils/affId";
import { getCredentialsForAffId } from "../services/affCredentialsService";
// 🆕 If you have a payload builder, import it
// import { buildPhonexaPayload } from "../utils/buildPayload";

// POST /api/forms/validate-step
export async function validateStep(req: Request, res: Response) {
  try {
    const { stepId, data, formId } = req.body;

    if (!stepId || !data) {
      return res.status(400).json({
        errors: [{ field: "general", message: "Missing stepId or data" }],
      });
    }

    const schema = getSchemaForStep(stepId);

    if (!schema) {
      console.error("getSchemaForStep returned undefined for stepId:", stepId);
      return res.status(400).json({
        errors: [{ field: "stepId", message: "Unknown stepId" }],
      });
    }

    // ✅ validate step data
    schema.parse(data);

    // ===== Transform consent boolean -> object =====
    let persistedData = { ...data };
    if (
      stepId === "personal-details" &&
      typeof persistedData.consent === "boolean"
    ) {
      persistedData.consent = persistedData.consent
        ? {
            text: undefined,
            acceptedAt: new Date(),
            ip:
              (req.headers["x-forwarded-for"] as string) ||
              req.ip ||
              req.socket?.remoteAddress ||
              undefined,
            userAgent: req.get("User-Agent") || undefined,
          }
        : {
            text: undefined,
            acceptedAt: null,
            ip: undefined,
            userAgent: undefined,
          };
    }
    // =====================================================

    const mappedPath = mapStepId(stepId);
    if (!mappedPath) {
      return res.status(400).json({
        errors: [{ field: "stepId", message: "Invalid mapping for stepId" }],
      });
    }

    function buildNestedObject(path: string, value: any) {
      const parts = path.split(".");
      const out: any = {};
      let cur = out;
      for (let i = 0; i < parts.length; i++) {
        const k = parts[i];
        if (i === parts.length - 1) {
          cur[k] = value;
        } else {
          cur[k] = {};
          cur = cur[k];
        }
      }
      return out;
    }

    let form = null;
    if (formId) {
      form = await Form.findByIdAndUpdate(
        formId,
        {
          $set: {
            [`steps.${mappedPath}`]: persistedData,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
    } else {
      const stepsObj = buildNestedObject(mappedPath, persistedData);
      form = await Form.create({ steps: stepsObj });
    }

    if (!form) {
      return res.status(500).json({ error: "Failed to save form" });
    }

    return res.json({ valid: true, formId: form._id.toString() });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        errors: err.issues.map((e) => ({
          field: e.path.join(".") || "field",
          message: e.message,
        })),
      });
    }

    console.error("❌ validateStep error:", err);
    return res.status(500).json({
      errors: [{ field: "server", message: "Internal server error" }],
    });
  }
}

// POST /api/forms/save
export async function saveForm(req: Request, res: Response) {
  try {
    const { formId, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Missing data" });
    }

    const isValidObjectId =
      typeof formId === "string" && formId.match(/^[0-9a-fA-F]{24}$/);

    const query = isValidObjectId ? { _id: formId } : { _id: undefined };

    const updatePayload: any = {};

    if (data.steps) {
      Object.entries(data.steps).forEach(([key, val]) => {
        updatePayload[`steps.${key}`] = val;
      });
    }

    if (data.final) {
      updatePayload.final = data.final;
    }

    const form = await Form.findOneAndUpdate(
      query,
      { $set: { ...updatePayload, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    return res.json({ success: true, form });
  } catch (err) {
    console.error("❌ saveForm error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/forms/submit
export async function submitForm(req: Request, res: Response) {
  try {
    const { formId, data } = req.body;
    const schema = getSchemaForStep("submit");
    schema.parse(data);

    const form = await Form.findOneAndUpdate(
      { _id: formId },
      { $set: { final: data, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    if (!form) {
      return res.status(500).json({ error: "Failed to submit form" });
    }

    // --- 🩵 PATCH: dynamic credentials + payload tracking ---
    try {
      const incomingAffId = (data as any)?.aff_id || undefined;
      const affInfo = getOrGenerateAffId(form, incomingAffId);
      const credResult = await getCredentialsForAffId(affInfo.affId);

      // Save credential metadata on form
      form.aff_id = affInfo.affId;
      form.usedAffId = credResult.usedAffId;
      form.originalAffId = credResult.originalAffId;
      form.affIdDefaulted = credResult.affIdDefaulted;
      form.apiCredentialsUsed = {
        apiId: credResult.apiId,
        apiPasswordKeyRef: credResult.apiPasswordKeyRef,
      };
      await form.save();

      // If you push to an external system (CRM / Phonexa)
      // const payload = buildPhonexaPayload(form, req.ip, credResult.usedAffId);
      // await pushLeadToCRM(payload);

      console.log(
        "✅ affId + apiCredentialsUsed updated for form:",
        form._id.toString()
      );
    } catch (metaErr) {
      console.error(
        "⚠️ Failed to persist aff_id / credentials metadata:",
        metaErr
      );
    }
    // --- 🩵 END PATCH ---

    return res.json({ success: true, form });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        errors: err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    console.error("❌ submitForm error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
