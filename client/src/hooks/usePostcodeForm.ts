// client/src/hooks/usePostcodeForm.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";

type Address = {
  id: string;
  label: string;
  house?: string;
  street?: string;
  city?: string;
  county?: string;
  postcode: string;
};

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function usePostcodeForm(returningToPostcode = false) {
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

  // UI suggestion states
  const [showCurrentSuggestions, setShowCurrentSuggestions] = useState(false);
  const [showPreviousSuggestions, setShowPreviousSuggestions] = useState(false);

  // timers and skip flags
  const currentTimer = useRef<number | null>(null);
  const previousTimer = useRef<number | null>(null);
  const skipCurrentLookup = useRef(false);
  const skipPreviousLookup = useRef(false);

  const currentPostcode = watch("currentPostcode");
  const previousPostcode = watch("previousPostcode");

  // 🧠 Restore previous toggle state
  useEffect(() => {
    const savedFlag = localStorage.getItem("showPrevAddress");
    if (savedFlag === "true") setShowPrevAddress(true);
  }, []);

  // 🧹 Persist toggle state
  useEffect(() => {
    localStorage.setItem("showPrevAddress", String(showPrevAddress));
    setValue("showPrevAddressFlag", showPrevAddress);
  }, [showPrevAddress, setValue]);

  // ✅ Helper: Filters incomplete addresses
  const filterCompleteAddresses = useCallback(
    (addresses: Address[]): Address[] =>
      addresses.filter(
        (a) =>
          a.house?.trim() &&
          a.street?.trim() &&
          a.city?.trim() &&
          a.postcode?.trim()
      ),
    []
  );

  // 🔍 Lookup logic
  const lookupAddress = useCallback(
    async (postcode: string, isPrevious = false) => {
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

        let addresses: Address[] = data.addresses || [];
        addresses = filterCompleteAddresses(addresses);

        if (addresses.length === 0) {
          if (isPrevious) {
            setError("previousPostcode", {
              type: "manual",
              message: "currentPostcode.lookupNoResults",
            });
            setPreviousAddresses([]);
          } else {
            setError("currentPostcode", {
              type: "manual",
              message: "currentPostcode.lookupNoResults",
            });
            setCurrentAddresses([]);
          }
        } else {
          if (isPrevious) {
            clearErrors("previousPostcode");
            setPreviousAddresses(addresses);
          } else {
            clearErrors("currentPostcode");
            setCurrentAddresses(addresses);
          }
        }
      } catch (err) {
        console.error("lookupAddress error:", err);
        const friendlyMessage =
          "Unable to fetch address. Please check postcode enter valid correct postcode or try again later.";

        if (isPrevious) {
          setError("previousPostcode", {
            type: "manual",
            message: friendlyMessage,
          });
          setPreviousAddresses([]);
        } else {
          setError("currentPostcode", {
            type: "manual",
            message: friendlyMessage,
          });
          setCurrentAddresses([]);
        }
      } finally {
        if (isPrevious) setLoadingPrevious(false);
        else setLoadingCurrent(false);
      }
    },
    [clearErrors, filterCompleteAddresses, setError]
  );

  // 📍 Select address logic
  const selectAddress = useCallback(
    (address: Address, isPrevious = false) => {
      const prefix = isPrevious ? "previousAddress" : "currentAddress";
      setValue(`${prefix}.house`, address.house || "");
      setValue(`${prefix}.street`, address.street || "");
      setValue(`${prefix}.city`, address.city || "");
      setValue(`${prefix}.county`, address.county || "");
      setValue(`${prefix}.postcode`, address.postcode);
      setValue(`${prefix}.label`, address.label);

      if (isPrevious) {
        skipPreviousLookup.current = true;
        setValue("previousPostcode", address.postcode);
        setShowPreviousSuggestions(false);
        clearErrors("previousPostcode");
      } else {
        skipCurrentLookup.current = true;
        setValue("currentPostcode", address.postcode);
        setShowCurrentSuggestions(false);
        clearErrors("currentPostcode");
      }
    },
    [clearErrors, setValue]
  );

  // 🔄 Debounced watcher for current postcode
  useEffect(() => {
    if (returningToPostcode) {
      skipCurrentLookup.current = true;
      skipPreviousLookup.current = true;
      return;
    }

    if (currentTimer.current) window.clearTimeout(currentTimer.current);
    const trimmed = currentPostcode?.trim().toUpperCase() || "";

    if (skipCurrentLookup.current) {
      skipCurrentLookup.current = false;
      return;
    }

    if (!trimmed) {
      setCurrentAddresses([]);
      setShowCurrentSuggestions(false);
      return;
    }

    setShowCurrentSuggestions(true);

    currentTimer.current = window.setTimeout(() => {
      if (UK_POSTCODE_REGEX.test(trimmed)) {
        clearErrors("currentPostcode");
        lookupAddress(trimmed, false);
      } else {
        setCurrentAddresses([]);
        if (trimmed.length > 0 && (trimmed.length < 5 || trimmed.length > 7)) {
          setError("currentPostcode", {
            type: "manual",
            message: "currentPostcode.format",
          });
        } else clearErrors("currentPostcode");
      }
    }, 500);

    return () => {
      if (currentTimer.current) window.clearTimeout(currentTimer.current);
    };
  }, [
    currentPostcode,
    clearErrors,
    lookupAddress,
    returningToPostcode,
    setError,
  ]);

  // 🔄 Debounced watcher for previous postcode
  useEffect(() => {
    if (returningToPostcode) {
      skipCurrentLookup.current = true;
      skipPreviousLookup.current = true;
      return;
    }

    if (previousTimer.current) window.clearTimeout(previousTimer.current);
    const trimmed = previousPostcode?.trim().toUpperCase() || "";

    if (skipPreviousLookup.current) {
      skipPreviousLookup.current = false;
      return;
    }

    if (!trimmed) {
      setPreviousAddresses([]);
      setShowPreviousSuggestions(false);
      return;
    }

    setShowPreviousSuggestions(true);

    previousTimer.current = window.setTimeout(() => {
      if (UK_POSTCODE_REGEX.test(trimmed)) {
        clearErrors("previousPostcode");
        lookupAddress(trimmed, true);
      } else {
        setPreviousAddresses([]);
        if (trimmed.length > 0 && (trimmed.length < 5 || trimmed.length > 7)) {
          setError("previousPostcode", {
            type: "manual",
            message: "previousPostcode.format",
          });
        } else clearErrors("previousPostcode");
      }
    }, 500);

    return () => {
      if (previousTimer.current) window.clearTimeout(previousTimer.current);
    };
  }, [
    previousPostcode,
    clearErrors,
    lookupAddress,
    returningToPostcode,
    setError,
  ]);

  // Dynamic validation for previousPostcode
  useEffect(() => {
    const rule = {
      validate: (val: string) => {
        if (!showPrevAddress) return true;
        if (val && val.trim().length > 0) return true;
        return "Please fill the previous postcode or remove the previous address";
      },
    };
    rhfRegister("previousPostcode", rule);
    if (!showPrevAddress) clearErrors("previousPostcode");
  }, [showPrevAddress, rhfRegister, clearErrors]);

  // Manual lookup trigger
  const manualLookup = useCallback(
    async (isPrevious = false) => {
      const postcode = isPrevious ? previousPostcode : currentPostcode;
      await lookupAddress(postcode, isPrevious);
      if (isPrevious) {
        if (previousAddresses.length > 0) setShowPreviousSuggestions(true);
      } else {
        if (currentAddresses.length > 0) setShowCurrentSuggestions(true);
      }
    },
    [
      lookupAddress,
      currentPostcode,
      previousPostcode,
      currentAddresses.length,
      previousAddresses.length,
    ]
  );

  // Clear previous address logic
  const clearPreviousAddress = useCallback(() => {
    setPreviousAddresses([]);
    setValue("previousPostcode", "");
    setValue("previousAddress", null);
    clearErrors("previousPostcode");
  }, [setValue, clearErrors]);

  return {
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
  };
}
