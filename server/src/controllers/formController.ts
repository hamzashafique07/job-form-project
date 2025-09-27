// server/src/controllers/formController.ts
import { Request, Response } from "express";
import { z } from "zod";
import { getSchemaForStep } from "@job-form/shared/schemas";
import { mapErrorKeyToMessage } from "../utils/errorMap";
import Form from "../models/Form";

export async function validateStep(req: Request, res: Response) {
  const { stepId, data, formId } = req.body;
  const schema = getSchemaForStep(stepId);

  if (!schema) {
    return res
      .status(400)
      .json({ errors: [{ field: "stepId", message: "Invalid stepId" }] });
  }

  try {
    schema.parse(data);

    const DEFAULT_AFF_ID = process.env.DEFAULT_AFF_ID || "AFF_DEFAULT";

    const updateData = {
      ...data,
      aff_id: data.aff_id || DEFAULT_AFF_ID,
      "meta.ip": req.ip,
      "meta.userAgent": req.headers["user-agent"] || "unknown",
      updatedAt: new Date(),
    };

    let form;
    if (formId) {
      form = await Form.findByIdAndUpdate(formId, { $set: updateData }, { new: true });
    } else {
      form = await Form.create(updateData);
    }

    return res.json({ valid: true, formId: form._id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((issue) => {
        const field = issue.path.join(".") || "field";
        const message = mapErrorKeyToMessage(issue.message) || issue.message;
        return { field, message };
      });
      return res.status(400).json({ errors });
    }

    console.error(err);
    return res
      .status(500)
      .json({ errors: [{ field: "field", message: "Internal error" }] });
  }
}
