//client/src/components/form/MultiStepForm.tsx
/** @format */
import { useState } from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSchemaForStep, FormData } from "@job-form/shared/schemas";

import Button from "../ui/Button";
import FormCard from "../ui/FormCard";

import PostcodeForm from "./Postcodeform";
import PersonalDetailsForm from "./PersonalDetailsForm";
import AddressLookupForm from "./AddressLookupForm";
import FinalSubmitForm from "./FinalSubmitForm";
import { useEffect } from "react";
import { mapErrorKeyToMessage } from "../../utils/errorMapClient";

// Step order
const steps = [
  "postcode",
  "personal-details",
  "address-lookup",
  "final",
] as const;

export default function MultiStepForm() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formId, setFormId] = useState<string | null>(null);

  const currentStep = steps[currentStepIndex];
  const schema = getSchemaForStep(currentStep);

  console.log("🔍 currentStep:", currentStep, "using schema:", schema);

  // Use `methods` so we can pass the whole form context via FormProvider
  const methods = useForm<any>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
  });

  // Still pull commonly used items for convenience
  const {
    register,
    handleSubmit,
    formState,
    reset,
    setError,
    setValue,
    getValues,
  } = methods;

  // ✅ Move this ABOVE useEffect
  function safeSerializeErrors(obj: any) {
    if (!obj || typeof obj !== "object") return obj;
    const clone: any = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "ref") continue; // 🚫 skip circular DOM refs
      if (typeof value === "object") clone[key] = safeSerializeErrors(value);
      else clone[key] = value;
    }
    return clone;
  }
  // 🧩 Enhanced client-side error mapper (safe + persistent)
  useEffect(() => {
    if (!formState.errors) return;

    // 🧹 Deep clone but strip circular refs (like HTMLInputElement)
    function safeSerializeErrors(obj: any) {
      if (!obj || typeof obj !== "object") return obj;
      const clone: any = Array.isArray(obj) ? [] : {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === "ref") continue; // 🚫 skip circular DOM refs
        if (typeof value === "object") clone[key] = safeSerializeErrors(value);
        else clone[key] = value;
      }
      return clone;
    }

    const safeErrors = safeSerializeErrors(formState.errors);
    const serialized = JSON.stringify(safeErrors);

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

    // 🧠 Depend on the safe serialized version
  }, [setError, JSON.stringify(safeSerializeErrors(formState.errors))]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(
      "✅ onSubmit triggered with data:",
      data,
      "currentStep:",
      currentStep,
      "formId:",
      formId
    );
    // 🔍 Debugging validation at the client side
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
        "→ calling /api/forms/save with fullFormData:",
        fullFormData,
        "formIdCandidate:",
        formId || body.formId
      );

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

      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        reset(fullFormData); // preserve all filled values
      } else {
        // 🧩 Always ensure formId is defined from all possible sources
        const finalFormId = newFormId || formId || body.formId;
        const finalData = {
          ...fullFormData,
          formId: finalFormId,
          optinurl: window.location.href, // ✅ capture opt-in URL
        };

        // 🆕 Step 1: Upload signature to Google Drive (if not already uploaded)
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
                formId: finalFormId, // <- ensure server can persist to DB
              }),
            });
            const uploadBody = await uploadRes.json();
            console.log("← upload/signature response:", uploadBody);

            if (uploadRes.ok && uploadBody.signatureFileUrl) {
              maybeSignatureData.signatureFileUrl = uploadBody.signatureFileUrl;
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

        // 🧾 Step 2: Continue with your existing /api/forms/submit call
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
          alert("🎉 Form submitted successfully!");
          console.log("Submitted form response:", submitBody);
        } else {
          if (Array.isArray(submitBody?.errors)) {
            submitBody.errors.forEach(
              (e: { field: string; message: string }) => {
                setError(e.field as any, {
                  type: "server",
                  message: e.message,
                });
              }
            );
          } else {
            console.error("❌ submit error:", submitBody);
            alert("❌ Failed to submit form. Check console.");
          }
        }
      }
    } catch (err) {
      console.error("✖ onSubmit caught error:", err);
      alert("Server error — check console");
    }
  };

  return (
    <FormCard title={`Step ${currentStepIndex + 1}: ${currentStep}`}>
      {/* Provide the RHF context to child components */}
      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={(e) => {
            console.log("➡️ form submit event fired for step:", currentStep);
            // 🛑 Guard: Prevent user from going next unless an address is selected for the entered postcode
            if (currentStep === "postcode") {
              const currentAddress = getValues("currentAddress");
              const postcode = getValues("currentPostcode");

              // Check if postcode is entered but no address selected
              if (postcode && !currentAddress?.label) {
                // Prevent any async validation or reset from clearing our manual error
                e.preventDefault();
                e.stopPropagation();

                setError("currentPostcode" as any, {
                  type: "manual",
                  message: "currentPostcode.selectAddressRequired",
                });

                console.warn(
                  "Blocked: no address selected for current postcode"
                );
                return; // stop submit here — don't trigger handleSubmit
              }
            }

            handleSubmit(onSubmit, (errors) => {
              console.warn("❌ validation failed, errors:", errors);
            })(e);
          }}
        >
          {currentStep === "postcode" && <PostcodeForm />}

          {currentStep === "personal-details" && (
            <PersonalDetailsForm
              register={register}
              errors={formState.errors}
              setValue={setValue}
            />
          )}

          {currentStep === "address-lookup" && (
            <AddressLookupForm register={register} errors={formState.errors} />
          )}

          {currentStep === "final" && (
            <FinalSubmitForm register={register} errors={formState.errors} />
          )}

          <div className="flex justify-end">
            <Button type="submit">
              {currentStepIndex < steps.length - 1 ? "Next Step" : "Submit"}
            </Button>
          </div>

          {/* Debug fallback button: directly invoke handleSubmit to bypass native form submission */}
          <button
            type="button"
            onClick={() => {
              console.log(
                "➡️ Debug fallback: calling handleSubmit(onSubmit) directly for step:",
                currentStep
              );
              handleSubmit(onSubmit)();
            }}
            style={{ marginLeft: 8 }}
          />
        </form>
      </FormProvider>
    </FormCard>
  );
}
