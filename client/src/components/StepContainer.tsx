// client/src/components/StepContainer.tsx
import React from "react";
import type { UseFormReturn } from "react-hook-form";

type Props = {
  stepId: string;
  form: UseFormReturn<any>;
  formId?: string | null;
  onServerSuccess?: (formId?: string) => void;
  children: React.ReactNode;
};

export default function StepContainer({ stepId, form, formId, onServerSuccess, children }: Props) {
  const { handleSubmit, getValues, setError } = form;

  async function handleNextClient(evt?: React.BaseSyntheticEvent) {
    // This wrapper allows child to call handleSubmit -> on valid client side then call server validate
    await handleSubmit(async () => {
      const data = getValues();
      const res = await fetch("/api/forms/validate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, data, formId }),
      });

      const body = await res.json();
      if (res.ok && body.valid) {
        if (onServerSuccess) onServerSuccess(body.formId);
      } else {
        if (body?.errors && Array.isArray(body.errors)) {
          body.errors.forEach((e: { field: string; message: string }) => {
            setError(e.field, { type: "server", message: e.message });
          });
        } else {
          console.error("Unexpected validation-step response", body);
          // set a general error if needed
        }
      }
    })(evt);
  }

  // Expose convenience props to children via context/props - keep simple: render children and instruct them to use form.handleSubmit(handleNextClient)
  return <div>{children}</div>;
}
