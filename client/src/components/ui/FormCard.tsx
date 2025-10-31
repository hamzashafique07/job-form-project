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
    <div className="max-w-4xl mx-auto pl-4 pr-4 pt-4 bg-white/90 backdrop-blur-sm rounded-2xl ">
      {title && (
        <h2 className="text-2xl font-medium mb-6 text-gray-800">{title}</h2>
      )}
      {children}
    </div>
  );
}
