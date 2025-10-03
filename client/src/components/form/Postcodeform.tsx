// client/src/components/form/PostcodeForm.tsx
import { useState } from "react";
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
  } = useFormContext();
  const [currentAddresses, setCurrentAddresses] = useState<Address[]>([]);
  const [previousAddresses, setPreviousAddresses] = useState<Address[]>([]);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [showPrevAddress, setShowPrevAddress] = useState(false);

  const currentPostcode = watch("currentPostcode");
  const previousPostcode = watch("previousPostcode");

  // 👉 Backend lookup (server will call getAddress.io)
  const lookupAddress = async (postcode: string, isPrevious = false) => {
    try {
      if (!postcode) return;
      if (isPrevious) setLoadingPrevious(true);
      else setLoadingCurrent(true);

      const res = await fetch("/api/address/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postcode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lookup failed");

      const addresses: Address[] = data.addresses;
      if (isPrevious) setPreviousAddresses(addresses);
      else setCurrentAddresses(addresses);
    } catch (err) {
      console.error(err);
      if (isPrevious) setPreviousAddresses([]);
      else setCurrentAddresses([]);
    } finally {
      if (isPrevious) setLoadingPrevious(false);
      else setLoadingCurrent(false);
    }
  };

  // 👉 Selecting an address auto-fills hidden fields
  const selectAddress = (address: Address, isPrevious = false) => {
    const prefix = isPrevious ? "previousAddress" : "currentAddress";
    setValue(`${prefix}.house`, address.house || "");
    setValue(`${prefix}.street`, address.street || "");
    setValue(`${prefix}.city`, address.city || "");
    setValue(`${prefix}.county`, address.county || "");
    setValue(`${prefix}.postcode`, address.postcode);
    setValue(`${prefix}.label`, address.label);
  };

  return (
    <div className="space-y-6">
      {/* Current Postcode */}
      <TextInput
        label="Current Postcode"
        placeholder="Enter postcode"
        {...register("currentPostcode")}
        error={errors.currentPostcode?.message as string}
      />
      <button
        type="button"
        onClick={() => lookupAddress(currentPostcode, false)}
        disabled={loadingCurrent}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loadingCurrent ? "Finding..." : "Find Address"}
      </button>

      {/* Dropdown for current address */}
      {currentAddresses.length > 0 && (
        <div className="space-y-2">
          <label>Select your address</label>
          <select
            onChange={(e) => {
              const addr = currentAddresses.find(
                (a) => a.id === e.target.value
              );
              if (addr) selectAddress(addr, false);
            }}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Select --</option>
            {currentAddresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.label}
              </option>
            ))}
          </select>
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
          <div className="space-y-4">
            <TextInput
              label="Previous Postcode"
              placeholder="Enter previous postcode"
              {...register("previousPostcode")}
              error={errors.previousPostcode?.message as string}
            />
            <button
              type="button"
              onClick={() => lookupAddress(previousPostcode, true)}
              disabled={loadingPrevious}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loadingPrevious ? "Finding..." : "Find Address"}
            </button>

            {previousAddresses.length > 0 && (
              <div className="space-y-2">
                <label>Select your previous address</label>
                <select
                  onChange={(e) => {
                    const addr = previousAddresses.find(
                      (a) => a.id === e.target.value
                    );
                    if (addr) selectAddress(addr, true);
                  }}
                  className="border p-2 rounded w-full"
                >
                  <option value="">-- Select --</option>
                  {previousAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowPrevAddress(false);
                setPreviousAddresses([]);
                setValue("previousPostcode", "");
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Remove Previous Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
