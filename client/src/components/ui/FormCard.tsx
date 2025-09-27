// client/src/components/ui/FormCard.tsx
import React from "react";

export default function FormCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}
