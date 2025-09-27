// client/src/hooks/useStepForm.ts
import { useState } from "react";

export default function useStepForm(totalSteps: number) {
  const [current, setCurrent] = useState(0);

  function next() {
    setCurrent((c) => Math.min(totalSteps - 1, c + 1));
  }
  function back() {
    setCurrent((c) => Math.max(0, c - 1));
  }
  return { currentStep: current, next, back, isFirst: current === 0, isLast: current === totalSteps - 1 };
}
