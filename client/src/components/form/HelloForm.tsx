/** @format */

// client/src/components/form/HelloForm.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { helloSchema } from "@shared/schemas";
import type { HelloData } from "@shared/schemas";

export default function HelloForm() {
  const { register, handleSubmit, formState } = useForm<HelloData>({
    resolver: zodResolver(helloSchema),
    defaultValues: { firstName: "" },
  });

  const onSubmit = async (data: HelloData) => {
    console.log("client-side valid:", data);

    // Call server-side validate-step
    const res = await fetch("/api/forms/validate-step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId: "hello", data }),
    });

    if (res.ok) {
      const body = await res.json();
      if (body.valid) alert("Server validation OK — ready to proceed");
    } else {
      const body = await res.json();
      console.error("server errors:", body.errors);
      alert("Server validation returned errors — check console");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-md mx-auto">
      <label className="block mb-2">First name</label>
      <input
        {...register("firstName")}
        className="border p-2 w-full mb-2"
        placeholder="Enter first name"
      />
      {formState.errors.firstName && (
        <p className="text-red-600 text-sm">
          {formState.errors.firstName.message}
        </p>
      )}

      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-sky-600 text-white rounded"
      >
        Validate (server + client)
      </button>
    </form>
  );
}
