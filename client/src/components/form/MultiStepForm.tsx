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

  const {
    register,
    handleSubmit,
    formState,
    reset,
    setError, // ✅ add setError here
  } = useForm<FormData>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const res = await fetch("/api/forms/validate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: currentStep, data, formId }),
      });

      const body = await res.json();

      if (res.ok && body.valid) {
        if (body.formId) setFormId(body.formId);

        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
          reset(data); // keep filled values
        } else {
          alert("Form completed successfully ✅");
        }
      } else {
        // ✅ Use setError so RHF shows server errors directly
        if (Array.isArray(body.errors)) {
          body.errors.forEach((e: { field: string; message: string }) => {
            setError(e.field as any, { type: "server", message: e.message });
          });
        } else {
          console.error("validate-step returned unexpected error body:", body);
          alert("Server returned an unexpected error. Check console.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Server error — check console");
    }
  };

  return (
    <FormCard title={`Step ${currentStepIndex + 1}: ${currentStep}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {currentStep === "hello" && (
          <HelloForm register={register} errors={formState.errors} />
        )}

        {currentStep === "personal-details" && (
          <PersonalDetailsForm register={register} errors={formState.errors} />
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
      </form>
    </FormCard>
  );
}
