//client/src/components/form/MultiStepForm.tsx
/** @format */
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSchemaForStep, FormData } from "@job-form/shared/schemas";

import Button from "../ui/Button";
import FormCard from "../ui/FormCard";

import HelloForm from "./HelloForm";
import PersonalDetailsForm from "./PersonalDetailsForm";
import AddressLookupForm from "./AddressLookupForm";
import FinalSubmitForm from "./FinalSubmitForm";

// Step order
const steps = ["hello", "personal-details", "address-lookup", "final"] as const;

export default function MultiStepForm() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formId, setFormId] = useState<string | null>(null);

  const currentStep = steps[currentStepIndex];
  const schema = getSchemaForStep(currentStep);

  console.log("🔍 currentStep:", currentStep, "using schema:", schema);

  const {
    register,
    handleSubmit,
    formState,
    reset,
    setError,
    setValue, // <-- for onBlur transforms
    getValues, // <-- to grab full form data at the end
  } = useForm<FormData>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(
      "✅ onSubmit triggered with data:",
      data,
      "currentStep:",
      currentStep,
      "formId:",
      formId
    );
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
        const finalFormId = newFormId;
        const finalData = fullFormData;

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
      <form
        noValidate
        onSubmit={(e) => {
          console.log("➡️ form submit event fired for step:", currentStep);
          handleSubmit(onSubmit, (errors) => {
            console.warn("❌ validation failed, errors:", errors);
          })(e);
        }}
      >
        {currentStep === "hello" && (
          <HelloForm register={register} errors={formState.errors} />
        )}

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

        <Button type="submit">
          {currentStepIndex < steps.length - 1 ? "Next Step" : "Submit"}
        </Button>

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
        ></button>
      </form>
    </FormCard>
  );
}
