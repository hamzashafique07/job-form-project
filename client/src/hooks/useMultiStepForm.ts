//client/src/hooks/useMultiStepForm.ts
/** @format */
import { useEffect, useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSchemaForStep, FormData } from "@job-form/shared/schemas";
import { mapErrorKeyToMessage } from "../utils/errorMapClient";

/**
 * Keep the step order exactly as before.
 * We export `steps` inside the hook return so the view can render titles the same way.
 */
export default function useMultiStepForm() {
  const steps = [
    "postcode",
    "personal-details",
    "address-lookup",
    "final",
  ] as const;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [formId, setFormId] = useState<string | null>(null);

  // Track when user navigates back to postcode step
  const [returningToPostcode, setReturningToPostcode] = useState(false);

  // UI status: "form" | "loading" | "thankyou"
  const [status, setStatus] = useState<"form" | "loading" | "thankyou">("form");

  const currentStep = steps[currentStepIndex];
  const schema = getSchemaForStep(currentStep);

  console.log("🔍 currentStep:", currentStep, "using schema:", schema);

  // Use `methods` so the caller can pass whole RHF context via FormProvider
  const methods = useForm<any>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
  });

  // Destructure commonly used handlers to keep the original usage easy in the view
  const {
    register,
    handleSubmit,
    formState,
    reset,
    setError,
    setValue,
    getValues,
  } = methods;

  // Single helper for safe serialization (strip circular refs)
  function safeSerializeErrors(obj: any) {
    if (!obj || typeof obj !== "object") return obj;
    const clone: any = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "ref") continue; // skip DOM refs
      if (typeof value === "object") clone[key] = safeSerializeErrors(value);
      else clone[key] = value;
    }
    return clone;
  }

  // Reset returningToPostcode flag once user is back on postcode step
  useEffect(() => {
    if (returningToPostcode && currentStep === "postcode") {
      setReturningToPostcode(false);
    }
  }, [currentStep, returningToPostcode]);

  // Enhanced client-side error mapper (safe + persistent)
  useEffect(() => {
    if (!formState.errors) return;

    const safeErrors = safeSerializeErrors(formState.errors);

    function traverseAndMap(obj: any, prefix = "") {
      if (!obj || typeof obj !== "object") return;
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && "message" in value) {
          const msg = (value as any).message;
          if (typeof msg === "string") {
            const friendly = mapErrorKeyToMessage(msg);
            if (friendly && friendly !== msg) {
              setError(path as any, {
                type: (value as any).type || "validate",
                message: friendly,
              });
            }
          }
        } else if (typeof value === "object") {
          traverseAndMap(value, path);
        }
      }
    }

    traverseAndMap(formState.errors);

    // Depend on a stable serialized representation to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setError, JSON.stringify(safeSerializeErrors(formState.errors))]);

  // Helper: auto-run address-lookup + final-submit logic silently (identical behavior)
  const runHiddenSubmissionFlow = useCallback(
    async (fullFormData: any, formIdArg: string | null) => {
      const sanitizedData = { ...fullFormData };

      if (!sanitizedData.previousPostcode) {
        delete sanitizedData.previousPostcode;
      }
      if (
        sanitizedData.previousAddress == null ||
        (typeof sanitizedData.previousAddress === "object" &&
          Object.keys(sanitizedData.previousAddress).length === 0)
      ) {
        delete sanitizedData.previousAddress;
      }

      try {
        setStatus("loading");

        // Step 3: validate address-lookup
        const addressRes = await fetch("/api/forms/validate-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stepId: "address-lookup",
            data: sanitizedData,
            formId: formIdArg,
          }),
        });
        const addressBody = await addressRes.json();
        console.log("← hidden validate-step (address-lookup):", addressBody);

        // Save intermediate state
        await fetch("/api/forms/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId: formIdArg, data: sanitizedData }),
        });

        // Step 4: upload signature + final submit
        const finalFormId = formIdArg;
        const finalData = {
          ...sanitizedData,
          formId: finalFormId,
          optinurl: window.location.href,
        };

        // Upload signature if present and not already uploaded
        if (finalData.signatureBase64 && !finalData.signatureFileUrl) {
          try {
            const uploadRes = await fetch("/api/upload/signature", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                signatureBase64: finalData.signatureBase64,
                formId: finalFormId,
              }),
            });
            const uploadBody = await uploadRes.json();
            if (uploadRes.ok && uploadBody.signatureFileUrl) {
              finalData.signatureFileUrl = uploadBody.signatureFileUrl;
            }
          } catch (err) {
            console.error("✖ Hidden signature upload failed:", err);
          }
        }

        // Submit final form
        const submitRes = await fetch("/api/forms/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId: finalFormId, data: finalData }),
        });
        const submitBody = await submitRes.json();
        console.log("← hidden submit body:", submitBody);

        if (submitRes.ok) {
          console.log("✅ Hidden flow complete → show thank-you");
          setStatus("thankyou");
        } else {
          console.error("❌ Hidden flow submit failed", submitBody);
          setStatus("form");
        }
      } catch (err) {
        console.error("✖ Hidden flow error:", err);
        setStatus("form");
      }
    },
    []
  );

  // The original onSubmit handler — preserved behavior
  const onSubmit: SubmitHandler<FormData> = useCallback(
    async (data) => {
      console.log(
        "✅ onSubmit triggered with data:",
        data,
        "currentStep:",
        currentStep,
        "formId:",
        formId
      );
      console.log("StepId:", currentStep, getSchemaForStep(currentStep));
      const stepSchema = getSchemaForStep(currentStep);
      if (!stepSchema) {
        console.error("❌ No schema found for step:", currentStep);
      } else {
        console.log("SafeParse result:", stepSchema.safeParse(data));
      }

      try {
        console.log("→ calling /api/forms/validate-step", {
          stepId: currentStep,
          data,
          formId,
        });
        const res = await fetch("/api/forms/validate-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepId: currentStep, data, formId }),
        });

        console.log("← validate-step HTTP status:", res.status);
        let body: any = null;
        try {
          body = await res.json();
          console.log("← validate-step body:", body);
        } catch (e) {
          console.error("✖ validate-step returned non-json or empty body", e);
          throw e;
        }

        if (!(res.ok && body && body.valid)) {
          console.warn(
            "✖ validate-step did not return valid=true; mapping errors if present",
            body
          );
          if (Array.isArray(body?.errors)) {
            body.errors.forEach((e: any) =>
              setError(e.field as any, { type: "server", message: e.message })
            );
          } else {
            alert("Server validation failed. Check console for details.");
          }
          return;
        }

        if (body.formId) setFormId(body.formId);

        const fullFormData = { ...getValues(), ...data };
        console.log(
          "→ (modified) handling save/navigation for fullFormData:",
          fullFormData,
          "formIdCandidate:",
          formId || body.formId
        );

        // If this is the postcode step, skip calling /api/forms/save to avoid creating a placeholder DB record.
        // We still validated the data above, so safely advance to next step and preserve form values in client.
        if (currentStep === "postcode") {
          console.log(
            "ℹ️ Skipping /api/forms/save for 'postcode' step (no DB write)."
          );
          // If server returned a formId for some reason, keep it
          if (body.formId) setFormId(body.formId);

          // Advance UI to next step exactly as original flow would
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
            reset(fullFormData);
          }
          // End early — do not call save / hidden flows on postcode
          return;
        }

        // OTHERWISE (not postcode) — perform the existing save behavior (unchanged)
        const saveRes = await fetch("/api/forms/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formId: formId || body.formId || null,
            data: fullFormData,
          }),
        });

        console.log("← save HTTP status:", saveRes.status);
        let saveBody: any = null;
        try {
          saveBody = await saveRes.json();
          console.log("← save body:", saveBody);
        } catch (e) {
          console.error("✖ save returned non-json", e);
        }

        if (!(saveRes.ok && saveBody && saveBody.success)) {
          console.warn("✖ save failed or returned success:false", saveBody);
          if (saveBody && Array.isArray(saveBody.errors)) {
            saveBody.errors.forEach((e: any) =>
              setError(e.field as any, { type: "server", message: e.message })
            );
          } else {
            alert("Failed to save step. Check console.");
          }
          return;
        }

        const newFormId =
          (saveBody.form && (saveBody.form._id || saveBody.form.id)) ||
          saveBody.formId ||
          formId ||
          body.formId ||
          null;

        if (newFormId) setFormId(newFormId);

        if (currentStep === "personal-details") {
          // after personal details → run hidden steps 3 + 4
          await runHiddenSubmissionFlow(fullFormData, newFormId);
          return;
        }

        if (currentStepIndex < steps.length - 1) {
          // Do NOT clear localStorage here; preserve showPrevAddress
          setCurrentStepIndex((prev) => prev + 1);
          reset(fullFormData);
        } else {
          // final submit flow (same as before)
          // (the remainder of onSubmit continues unchanged)

          // final submit flow (same as before)
          const finalFormId = newFormId || formId || body.formId;
          const finalData = {
            ...fullFormData,
            formId: finalFormId,
            optinurl: window.location.href,
          };

          const maybeSignatureData = finalData as Record<string, any>;
          if (
            maybeSignatureData.signatureBase64 &&
            !maybeSignatureData.signatureFileUrl
          ) {
            try {
              console.log("📤 Uploading signature to Drive...");
              const uploadRes = await fetch("/api/upload/signature", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  signatureBase64: maybeSignatureData.signatureBase64,
                  formId: finalFormId,
                }),
              });
              const uploadBody = await uploadRes.json();
              console.log("← upload/signature response:", uploadBody);

              if (uploadRes.ok && uploadBody.signatureFileUrl) {
                maybeSignatureData.signatureFileUrl =
                  uploadBody.signatureFileUrl;
                console.log(
                  "✅ Signature uploaded to Drive:",
                  uploadBody.signatureFileUrl
                );
              } else {
                console.warn("⚠️ Drive upload failed:", uploadBody);
              }
            } catch (err) {
              console.error("✖ Error uploading signature to Drive:", err);
            }
          }

          setStatus("loading");

          console.log(
            "→ calling /api/forms/submit with finalFormId:",
            finalFormId
          );
          const submitRes = await fetch("/api/forms/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formId: finalFormId, data: finalData }),
          });

          let submitBody: any = null;
          try {
            submitBody = await submitRes.json();
            console.log("← submit body:", submitBody);
          } catch (e) {
            console.error("✖ submit returned non-json", e);
          }

          if (submitRes.ok) {
            console.log("✅ Form submitted successfully:", submitBody);
            setStatus("thankyou");
          } else {
            console.error("❌ Submit failed:", submitBody);
            if (Array.isArray(submitBody?.errors)) {
              submitBody.errors.forEach(
                (e: { field: string; message: string }) => {
                  setError(e.field as any, {
                    type: "server",
                    message: e.message,
                  });
                }
              );
            }
            setStatus("form");
          }
        }
      } catch (err) {
        console.error("✖ onSubmit caught error:", err);
        setStatus("form");
      }
    },
    // keep dependencies minimal and stable; functions used inside are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStep, currentStepIndex, formId, runHiddenSubmissionFlow]
  );

  // Return everything the view expects
  return {
    currentStep,
    currentStepIndex,
    methods,
    formId,
    returningToPostcode,
    setReturningToPostcode,
    status,
    setStatus,
    onSubmit,
    steps,
    setCurrentStepIndex,
    runHiddenSubmissionFlow,
    // convenience exports mirrored from methods (so view can destructure easily if desired)
    register,
    handleSubmit,
    formState,
    reset,
    setError,
    setValue,
    getValues,
  } as const;
}
