// client/src/components/ui/Button.tsx
import React from "react";

export default function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        (props.className ?? "") +
        " px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
      }
    />
  );
}
