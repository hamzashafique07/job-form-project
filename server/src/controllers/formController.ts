// server/src/controllers/formController.ts
import { Request, Response } from "express";
import { z } from "zod";
import { getSchemaForStep } from "@job-form/shared/schemas";
import Form from "../models/Form";
import { mapStepId } from "../utils/stepIdMapper";
import { getOrGenerateAffId } from "../utils/affId";
import { getCredentialsForAffId } from "../services/affCredentialsService";
import { mapToPhonexaPayload } from "../lib/phonexaMapper";
import { mapErrorKeyToMessage } from "../utils/errorMap";

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

    // 🩵 Prevent empty record creation on step 1
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
    } else if (stepId !== "personal-details") {
      // Only create new Form AFTER step 1
      const stepsObj = buildNestedObject(mappedPath, persistedData);
      form = await Form.create({ steps: stepsObj });
    }

    // 🩵 If we skipped DB creation (e.g., step 1), just return valid without formId
    if (!form) {
      return res.json({ valid: true });
    }

    return res.json({ valid: true, formId: form._id.toString() });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log("🪵 RAW ZOD ERRORS:", JSON.stringify(err.issues, null, 2));
      const mappedErrors = err.issues.map((e) => {
        const key = e.message;
        const friendly = mapErrorKeyToMessage(key) || key;
        return {
          field: e.path.join(".") || "field",
          message: friendly,
        };
      });
      return res.status(400).json({ errors: mappedErrors });
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

    // --- 🩵 PATCH: dynamic credentials + payload tracking + CRM push ---
    try {
      const incomingAffId = (data as any)?.aff_id || undefined;
      const affInfo = getOrGenerateAffId(form, incomingAffId);
      const credResult = await getCredentialsForAffId(affInfo.affId);

      // persist aff/credential metadata
      form.aff_id = affInfo.affId;
      form.usedAffId = credResult.usedAffId;
      form.originalAffId = credResult.originalAffId;
      form.affIdDefaulted = credResult.affIdDefaulted;
      form.apiCredentialsUsed = {
        apiId: credResult.apiId,
        apiPasswordKeyRef: credResult.apiPasswordKeyRef,
      };
      await form.save();

      console.log(
        "✅ affId + apiCredentialsUsed updated for form:",
        form._id.toString()
      );

      // Build a "leadDoc" shape expected by your existing buildPhonexaPayload util.
      const leadDoc: any = {
        firstName: form.steps?.personalDetails?.firstName,
        lastName: form.steps?.personalDetails?.lastName,
        email: form.steps?.personalDetails?.email,
        phone: form.steps?.personalDetails?.phone,
        iva: form.steps?.personalDetails?.iva,
        title: form.steps?.personalDetails?.title,
        dob: form.steps?.personalDetails?.dob,
        currentAddress: form.steps?.addressLookup?.currentAddress || undefined,
        previousAddress:
          form.steps?.addressLookup?.previousAddress || undefined,
        signatureFileUrl: form.final?.signatureFileUrl,
        signatureBase64: form.final?.signatureBase64,
        meta: form.meta || {},
        validationStatuses: form.validationStatuses || {},
      };

      form.crmStatus = "pending";
      form.crmResponse = {};
      await form.save();

      // build "meta" with form-level data and req context (type-safe by casting unknown fields to any)
      const fm: any = form; // allow dynamic fields without TS errors

      // 🩵 ensure optinurl always populated
      if (!data.optinurl) {
        data.optinurl =
          process.env.OPTIN_URL ||
          req.get("origin") ||
          "https://claim3000.co.uk";
      }

      const meta: Record<string, any> = {
        aff_id: credResult.usedAffId,
        apiId: form.apiCredentialsUsed?.apiId ?? undefined,
        // pass the Drive URL if available
        signatureFileUrl: fm?.final?.signatureFileUrl ?? undefined,
        // pass timestamps & request context
        createdAt: fm?.createdAt,
        updatedAt: fm?.updatedAt,
        landingTime: fm?.createdAt,
        submissionTime: fm?.updatedAt,
        signatureTime:
          fm?.final?.signatureTime ??
          fm?.steps?.personalDetails?.consent?.acceptedAt ??
          undefined,
        userIp:
          req.ip ||
          req.socket?.remoteAddress ||
          fm?.steps?.personalDetails?.consent?.ip ||
          undefined,
        userAgent:
          req.get("User-Agent") ||
          fm?.steps?.personalDetails?.consent?.userAgent ||
          undefined,
        buyer: "CLAIM3000",
        optinurl:
          data.optinurl ??
          process.env.OPTIN_URL ??
          fm?.meta?.optinurl ??
          undefined,
        stlLeadId: fm?.stlLeadId ?? undefined,
        // Keep any other dynamic fields grouped on meta.extraSpare if needed
        extraSpare: fm?.meta?.extraSpare ?? undefined,
      };

      // now call the improved mapper with both leadDoc and meta
      const payload = mapToPhonexaPayload(
        {
          // pass known personal fields; mapper is defensive so missing values are fine
          title: leadDoc.title,
          firstName: leadDoc.firstName,
          lastName: leadDoc.lastName,
          dob: leadDoc.dob,
          email: leadDoc.email,
          phone: leadDoc.phone,
          iva: leadDoc.iva,
          currentAddress: leadDoc.currentAddress,
          previousAddress: leadDoc.previousAddress,
          signatureBase64: leadDoc.signatureBase64,
          // some payloads expected explicit keys too
          signatureFileUrl: form.final?.signatureFileUrl,
        },
        meta
      );

      console.log("✅ Mapped Phonexa payload:", payload);

      const { postLeadToPhonexa } = require("../services/phonexaService");
      const crmResult = await postLeadToPhonexa(payload, {
        apiId: form.apiCredentialsUsed?.apiId || null,
        apiPasswordKeyRef: form.apiCredentialsUsed?.apiPasswordKeyRef || null,
      });

      if (
        crmResult.ok &&
        crmResult.status &&
        crmResult.status >= 200 &&
        crmResult.status < 300
      ) {
        form.crmStatus = "sent";
        form.crmResponse = crmResult.data;
      } else if (
        crmResult.ok === false &&
        crmResult.status &&
        crmResult.status >= 500
      ) {
        form.crmStatus = "queued";
        form.crmResponse = {
          status: crmResult.status,
          body: crmResult.data || null,
          error: crmResult.error || null,
        };
      } else {
        form.crmStatus = "failed";
        form.crmResponse = {
          status: (crmResult as any).status || null,
          body: (crmResult as any).data || null,
          error: (crmResult as any).error || null,
        };
      }

      await form.save();
      console.log(
        "CRM result persisted for form:",
        form._id.toString(),
        form.crmStatus
      );
    } catch (metaErr) {
      console.error(
        "⚠️ Failed to persist aff_id / credentials metadata or push to CRM:",
        metaErr
      );
      try {
        (form as any).crmStatus = "failed";
        (form as any).crmResponse = { error: String(metaErr) };
        await form.save();
      } catch (quietErr) {
        console.error("Also failed saving crm failure metadata:", quietErr);
      }
    }
    // --- 🩵 END PATCH ---

    return res.json({ success: true, form });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log("🪵 RAW ZOD ERRORS:", JSON.stringify(err.issues, null, 2));
      const mappedErrors = err.issues.map((e) => {
        const key = e.message;
        const friendly = mapErrorKeyToMessage(key) || key;
        return {
          field: e.path.join(".") || "field",
          message: friendly,
        };
      });
      return res.status(400).json({ errors: mappedErrors });
    }

    console.error("❌ submitForm error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
