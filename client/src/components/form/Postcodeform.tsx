// client/src/components/form/Postcodeform.tsx
import React, { useRef, useEffect } from "react";
import TextInput from "../ui/TextInput";
import { usePostcodeForm } from "../../hooks/usePostcodeForm";

export default function PostcodeForm({
  returningToPostcode = false,
}: {
  returningToPostcode?: boolean;
}) {
  const {
    register,
    errors,
    currentAddresses,
    previousAddresses,
    loadingCurrent,
    loadingPrevious,
    showPrevAddress,
    setShowPrevAddress,
    showCurrentSuggestions,
    showPreviousSuggestions,
    selectAddress,
    manualLookup,
    clearPreviousAddress,
    watch,
  } = usePostcodeForm(returningToPostcode);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // click outside to close suggestions
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target as Node)) return;
      // hide suggestion dropdowns
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="space-y-6">
      {/* Current Postcode */}
      <div ref={wrapperRef} className="relative">
        <label className="block mb-1 font-medium">Current Postcode</label>
        <div className="relative flex flex-col">
          <div className="relative h-10">
            <TextInput
              placeholder="Enter postcode"
              {...register("currentPostcode")}
              className="pr-24 absolute inset-0"
            />
            <button
              type="button"
              onClick={() => manualLookup(false)}
              disabled={loadingCurrent}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md shadow"
            >
              {loadingCurrent ? "Finding..." : "Find"}
            </button>
          </div>
          {errors.currentPostcode?.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPostcode.message as string}
            </p>
          )}
        </div>

        {showCurrentSuggestions && currentAddresses.length > 0 && (
          <ul className="mt-2 max-h-60 overflow-auto border rounded bg-white shadow z-50">
            {currentAddresses.map((a) => (
              <li
                key={a.id}
                onClick={() => selectAddress(a, false)}
                className="p-3 hover:bg-gray-100 cursor-pointer"
              >
                <div className="font-medium">{a.label}</div>
                <div className="text-sm text-gray-600">
                  {a.house ? `${a.house}, ` : ""}
                  {a.street ? `${a.street}, ` : ""}
                  {a.city ? `${a.city}` : ""}{" "}
                  {a.postcode ? ` • ${a.postcode}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {watch("currentAddress.label") && (
        <div className="border rounded p-3 bg-green-200">
          <h4 className="font-semibold">Selected current address</h4>
          <p className="text-sm">{watch("currentAddress.label")}</p>
        </div>
      )}

      {/* Previous Address toggle */}
      <div className="mt-4">
        {!showPrevAddress ? (
          <button
            type="button"
            onClick={() => setShowPrevAddress(true)}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            + Add Previous Address
          </button>
        ) : (
          <div className="space-y-3">
            <div className="relative flex flex-col">
              <label className="block mb-1 font-medium">
                Previous Postcode
              </label>
              <div className="relative h-10">
                <TextInput
                  placeholder="Enter previous postcode"
                  {...register("previousPostcode")}
                  className="pr-24 absolute inset-0"
                />
                <button
                  type="button"
                  onClick={() => manualLookup(true)}
                  disabled={loadingPrevious}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md shadow"
                >
                  {loadingPrevious ? "Finding..." : "Find"}
                </button>
              </div>
              {errors.previousPostcode?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.previousPostcode.message as string}
                </p>
              )}
              {showPreviousSuggestions && previousAddresses.length > 0 && (
                <ul className="mt-2 max-h-60 overflow-auto border rounded bg-white shadow z-50">
                  {previousAddresses.map((a) => (
                    <li
                      key={a.id}
                      onClick={() => selectAddress(a, true)}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="font-medium">{a.label}</div>
                      <div className="text-sm text-gray-600">
                        {a.house ? `${a.house}, ` : ""}
                        {a.street ? `${a.street}, ` : ""}
                        {a.city ? `${a.city}` : ""}{" "}
                        {a.postcode ? ` • ${a.postcode}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {watch("previousAddress.label") && (
              <div className="border rounded p-3 bg-green-200">
                <h4 className="font-semibold">Selected previous address</h4>
                <p className="text-sm">{watch("previousAddress.label")}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPrevAddress(false);
                  clearPreviousAddress();
                }}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove Previous Address
              </button>
              <div className="text-sm text-gray-600 self-center">
                Or fill the previous postcode to continue
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
