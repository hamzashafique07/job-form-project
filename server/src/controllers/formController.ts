// server/src/controllers/formController.ts
import { Request, Response } from "express";
import { z } from "zod";
import { getSchemaForStep } from "@job-form/shared/schemas";

// POST /api/forms/validate-step
export async function validateStep(req: Request, res: Response) {
  try {
    const { stepId, data } = req.body;

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

    schema.parse(data);

    return res.json({ valid: true });
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
