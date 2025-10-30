//client/src/components/form/MultiStepForm.tsx
/** @format */
import React from "react";
import { FormProvider } from "react-hook-form"; // ✅ Added import
import useMultiStepForm from "../../hooks/useMultiStepForm";
import Button from "../ui/Button";
import FormCard from "../ui/FormCard";

import PostcodeForm from "./Postcodeform";
import PersonalDetailsForm from "./PersonalDetailsForm";
import AddressLookupForm from "./AddressLookupForm";
import FinalSubmitForm from "./FinalSubmitForm";
import LoadingScreen from "./LoadingScreen";
import ThankYouScreen from "./ThankYouScreen";

/**
 * Minimal view that uses the hook for all logic/state.
 * All runtime behavior, network calls, validation mapping, and side effects
 * are preserved inside the hook.
 */
export default function MultiStepForm() {
  const {
    currentStep,
    currentStepIndex,
    methods,
    returningToPostcode,
    setReturningToPostcode,
    status,
    setStatus,
    onSubmit,
    steps,
    setCurrentStepIndex,
    runHiddenSubmissionFlow,
    // helpers from methods (convenience)
    handleSubmit,
    setError,
    getValues,
    formState,
    register,
    setValue,
  } = useMultiStepForm();

  // unchanged UI switching
  if (status === "loading") return <LoadingScreen />;
  if (status === "thankyou") return <ThankYouScreen />;

  return (
    <FormCard title={`Step ${currentStepIndex + 1}: ${currentStep}`}>
      {/* ✅ Correctly use FormProvider */}
      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={(e) => {
            console.log("➡️ form submit event fired for step:", currentStep);

            // Guard logic identical to previous version (postcode checks)
            if (currentStep === "postcode") {
              const currentAddress = getValues("currentAddress");
              const postcode = getValues("currentPostcode");
              const previousAddress = getValues("previousAddress");
              const previousPostcode = getValues("previousPostcode");
              const showPrevAddress = !!getValues("showPrevAddressFlag");

              if (postcode && !currentAddress?.label) {
                e.preventDefault();
                e.stopPropagation();
                setError("currentPostcode" as any, {
                  type: "manual",
                  message: "currentPostcode.selectAddressRequired",
                });
                console.warn(
                  "Blocked: no address selected for current postcode"
                );
                return;
              }

              if (showPrevAddress) {
                if (!previousPostcode) {
                  e.preventDefault();
                  e.stopPropagation();
                  setError("previousPostcode" as any, {
                    type: "manual",
                    message:
                      "Please fill the previous postcode or remove the previous address",
                  });
                  console.warn("Blocked: previous postcode is empty");
                  return;
                }

                if (previousPostcode && !previousAddress?.label) {
                  e.preventDefault();
                  e.stopPropagation();
                  setError("previousPostcode" as any, {
                    type: "manual",
                    message:
                      "Please select an address for the previous postcode",
                  });
                  console.warn(
                    "Blocked: no address selected for previous postcode"
                  );
                  return;
                }
              }
            }

            handleSubmit(onSubmit, (errors) => {
              console.warn("❌ validation failed, errors:", errors);
            })(e);
          }}
        >
          {currentStep === "postcode" && (
            <PostcodeForm returningToPostcode={returningToPostcode} />
          )}

          {currentStep === "personal-details" && (
            <PersonalDetailsForm
              register={register}
              errors={formState.errors}
              setValue={setValue}
            />
          )}

          {/* Keep address lookup & final commented out as before (or enable if desired) */}
          {/* {currentStep === "address-lookup" && (
            <AddressLookupForm register={register} errors={formState.errors} />
          )}

          {currentStep === "final" && (
            <FinalSubmitForm register={register} errors={formState.errors} />
          )} */}

          <div className="flex justify-between mt-6">
            {currentStepIndex > 0 ? (
              <Button
                type="button"
                onClick={() => {
                  if (currentStepIndex === 1) {
                    setReturningToPostcode(true);
                    console.log("🔙 User navigating back to postcode step");
                  }
                  setCurrentStepIndex((i) => i - 1);
                }}
              >
                ← Back
              </Button>
            ) : (
              <div />
            )}

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
      {/* ✅ Correct closing tag */}
    </FormCard>
  );
}
