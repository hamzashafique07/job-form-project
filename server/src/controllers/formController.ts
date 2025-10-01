// server/src/controllers/formController.ts
import { Request, Response } from "express";
import { z } from "zod";
import { getSchemaForStep } from "@job-form/shared/schemas";
import Form from "../models/Form"; // ✅ make sure this model exists

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
      return res.status(400).json({
        errors: [{ field: "stepId", message: "Unknown stepId" }],
      });
    }

    // ✅ validate step data with Zod
    schema.parse(data);

    // ✅ ensure formId exists (reuse or create new Form)
    let form = null;
    if (formId) {
      form = await Form.findByIdAndUpdate(
        formId,
        { $set: { ...data, updatedAt: new Date() } },
        { new: true }
      );
    } else {
      form = await Form.create({ ...data });
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
      { ...data, updatedAt: new Date() },
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

    const schema = getSchemaForStep("fullForm");
    schema.parse(data); // ✅ full Zod validation

    const form = await Form.findOneAndUpdate(
      { _id: formId },
      { ...data, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // TODO: push to CRM here
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
