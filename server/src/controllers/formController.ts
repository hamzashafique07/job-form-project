// server/src/controllers/formController.ts
import { Request, Response } from "express";
import { z } from "zod";
import { getSchemaForStep } from "@job-form/shared/schemas";
import Form from "../models/Form";
import { mapStepId } from "../utils/stepIdMapper";

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

    // ===== Patch: transform consent boolean -> object =====
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

    // Map external stepId to internal Mongo path
    const mappedPath = mapStepId(stepId);
    if (!mappedPath) {
      return res.status(400).json({
        errors: [{ field: "stepId", message: "Invalid mapping for stepId" }],
      });
    }

    // helper: create nested object for mappedPath "addressLookup.postcode"
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
      // update: set the nested path using dot notation
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
      // create: create nested steps object according to mappedPath
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

    const form = await Form.findOneAndUpdate(
      { _id: formId },
      { $set: { ...data, updatedAt: new Date() } },
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

    const schema = getSchemaForStep("submit"); // ✅ use final schema
    schema.parse(data);

    const form = await Form.findOneAndUpdate(
      { _id: formId },
      { $set: { final: data, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    if (!form) {
      return res.status(500).json({ error: "Failed to submit form" });
    }

    // TODO: push to CRM or external system
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
