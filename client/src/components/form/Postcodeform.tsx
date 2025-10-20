// client/src/components/form/Postcodeform.tsx
import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import TextInput from "../ui/TextInput";

type Address = {
  id: string;
  label: string;
  house?: string;
  street?: string;
  city?: string;
  county?: string;
  postcode: string;
};

export default function PostcodeForm() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
    register: rhfRegister,
  } = useFormContext();

  const [currentAddresses, setCurrentAddresses] = useState<Address[]>([]);
  const [previousAddresses, setPreviousAddresses] = useState<Address[]>([]);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [showPrevAddress, setShowPrevAddress] = useState(false);

  const currentPostcode = watch("currentPostcode");
  const previousPostcode = watch("previousPostcode");

  // UI suggestions open state
  const [showCurrentSuggestions, setShowCurrentSuggestions] = useState(false);
  const [showPreviousSuggestions, setShowPreviousSuggestions] = useState(false);

  // debounce timers
  const currentTimer = useRef<number | null>(null);
  const previousTimer = useRef<number | null>(null);

  // lookupAddress unchanged business-logic; still calls server endpoint
  const lookupAddress = async (postcode: string, isPrevious = false) => {
    try {
      if (!postcode || postcode.trim().length === 0) {
        if (isPrevious) setPreviousAddresses([]);
        else setCurrentAddresses([]);
        return;
      }

      if (isPrevious) setLoadingPrevious(true);
      else setLoadingCurrent(true);

      const res = await fetch("/api/address/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Lookup failed");

      const addresses: Address[] = data.addresses || [];
      if (isPrevious) setPreviousAddresses(addresses);
      else setCurrentAddresses(addresses);
    } catch (err) {
      console.error("lookupAddress error:", err);
      if (isPrevious) setPreviousAddresses([]);
      else setCurrentAddresses([]);
    } finally {
      if (isPrevious) setLoadingPrevious(false);
      else setLoadingCurrent(false);
    }
  };

  // Selecting an address auto-fills the same hidden fields as before
  const selectAddress = (address: Address, isPrevious = false) => {
    const prefix = isPrevious ? "previousAddress" : "currentAddress";
    setValue(`${prefix}.house`, address.house || "");
    setValue(`${prefix}.street`, address.street || "");
    setValue(`${prefix}.city`, address.city || "");
    setValue(`${prefix}.county`, address.county || "");
    setValue(`${prefix}.postcode`, address.postcode);
    setValue(`${prefix}.label`, address.label);
    // also set the postcode field itself to the normalized postcode (optional UX)
    if (isPrevious) setValue("previousPostcode", address.postcode);
    else setValue("currentPostcode", address.postcode);

    // hide suggestions after select
    if (isPrevious) setShowPreviousSuggestions(false);
    else setShowCurrentSuggestions(false);

    // clear any errors related to this field
    if (isPrevious) clearErrors("previousPostcode");
    else clearErrors("currentPostcode");
  };

  // ✅ Add this regex constant once near top of component (just before first useEffect)
  const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

  // --- Current Postcode watcher ---
  useEffect(() => {
    if (currentTimer.current) window.clearTimeout(currentTimer.current);

    const trimmed = currentPostcode?.trim().toUpperCase() || "";

    if (!trimmed) {
      setCurrentAddresses([]);
      setShowCurrentSuggestions(false);
      return;
    }

    // Show suggestion box as user types
    setShowCurrentSuggestions(true);

    currentTimer.current = window.setTimeout(() => {
      // ✅ Lookup only when postcode passes regex
      if (UK_POSTCODE_REGEX.test(trimmed)) {
        lookupAddress(trimmed, false);
      } else {
        // Optional: clear invalid partial suggestions
        setCurrentAddresses([]);
      }
    }, 500);

    return () => {
      if (currentTimer.current) window.clearTimeout(currentTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPostcode]);

  // --- Previous Postcode watcher ---
  useEffect(() => {
    if (previousTimer.current) window.clearTimeout(previousTimer.current);

    const trimmed = previousPostcode?.trim().toUpperCase() || "";

    if (!trimmed) {
      setPreviousAddresses([]);
      setShowPreviousSuggestions(false);
      return;
    }

    setShowPreviousSuggestions(true);

    previousTimer.current = window.setTimeout(() => {
      // ✅ Lookup only when postcode passes regex
      if (UK_POSTCODE_REGEX.test(trimmed)) {
        lookupAddress(trimmed, true);
      } else {
        setPreviousAddresses([]);
      }
    }, 500);

    return () => {
      if (previousTimer.current) window.clearTimeout(previousTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousPostcode]);

  // Register dynamic validation for previousPostcode: required only when showPrevAddress true
  useEffect(() => {
    // RHF register returns a function; we call it once to create the validation rule.
    // We also re-register when showPrevAddress changes.
    const rule = {
      validate: (val: string) => {
        if (!showPrevAddress) return true;
        if (val && val.toString().trim().length > 0) return true;
        return "Please fill the previous postcode or remove the previous address";
      },
    };
    // register via rhfRegister so we don't break existing spread register usage
    rhfRegister("previousPostcode", rule);
    // clear error when toggling off
    if (!showPrevAddress) clearErrors("previousPostcode");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPrevAddress]);

  // small helper to manually run lookup (Find button)
  const manualLookup = (isPrevious = false) => {
    if (isPrevious) lookupAddress(previousPostcode, true);
    else lookupAddress(currentPostcode, false);
    if (isPrevious) setShowPreviousSuggestions(true);
    else setShowCurrentSuggestions(true);
  };

  // click-away / blur behavior: close suggestions when clicking outside
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target as Node)) return;
      setShowCurrentSuggestions(false);
      setShowPreviousSuggestions(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="space-y-6">
      {/* Current Postcode */}
      <div ref={wrapperRef} className="relative">
        <label className="block mb-1 font-medium">Current Postcode</label>

        {/* Fixed-height wrapper to keep Find button static */}
        <div className="relative flex flex-col">
          <div className="relative h-10">
            <TextInput
              placeholder="Enter postcode"
              {...register("currentPostcode")}
              className="pr-24 absolute inset-0"
              error={undefined}
            />

            <button
              type="button"
              onClick={() => manualLookup(false)}
              disabled={loadingCurrent}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md shadow"
              aria-label="Find current address"
            >
              {loadingCurrent ? "Finding..." : "Find"}
            </button>
          </div>

          {/* Show error message below without shifting layout */}
          {errors.currentPostcode?.message && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPostcode.message as string}
            </p>
          )}
        </div>

        {/* suggestions popup - unchanged */}
        {showCurrentSuggestions && currentAddresses.length > 0 && (
          <ul
            role="listbox"
            aria-label="Current address suggestions"
            className="mt-2 max-h-60 overflow-auto border rounded bg-white shadow z-50"
          >
            {currentAddresses.map((a) => (
              <li
                key={a.id}
                role="option"
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

      {/* Display selected current address if present */}
      {watch("currentAddress.label") && (
        <div className="border rounded p-3 bg-gray-50">
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
                  error={undefined}
                />

                <button
                  type="button"
                  onClick={() => manualLookup(true)}
                  disabled={loadingPrevious}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md shadow"
                  aria-label="Find previous address"
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

            {/* display selected previous address if present */}
            {watch("previousAddress.label") && (
              <div className="border rounded p-3 bg-gray-50">
                <h4 className="font-semibold">Selected previous address</h4>
                <p className="text-sm">{watch("previousAddress.label")}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPrevAddress(false);
                  setPreviousAddresses([]);
                  setValue("previousPostcode", "");
                  setValue("previousAddress.house", "");
                  setValue("previousAddress.street", "");
                  setValue("previousAddress.city", "");
                  setValue("previousAddress.county", "");
                  setValue("previousAddress.postcode", "");
                  setValue("previousAddress.label", "");
                  clearErrors("previousPostcode");
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
