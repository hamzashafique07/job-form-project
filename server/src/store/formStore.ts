//server/src/store/formStore.ts
/** @format */
import { randomUUID } from "crypto";

type StepData = Record<string, any>;

export interface FormRecord {
  id: string;
  steps: Record<string, StepData>; // stepId → data
  createdAt: number;
  updatedAt: number;
}

// in-memory map
const forms = new Map<string, FormRecord>();

export function createForm(): FormRecord {
  const id = randomUUID();
  const now = Date.now();
  const form: FormRecord = {
    id,
    steps: {},
    createdAt: now,
    updatedAt: now,
  };
  forms.set(id, form);
  return form;
}

export function getForm(id: string): FormRecord | undefined {
  return forms.get(id);
}

export function saveStep(
  formId: string,
  stepId: string,
  data: StepData
): FormRecord {
  let form = forms.get(formId);
  const now = Date.now();
  if (!form) {
    // auto-create if not found
    form = { id: formId, steps: {}, createdAt: now, updatedAt: now };
    forms.set(formId, form);
  }
  form.steps[stepId] = data;
  form.updatedAt = now;
  return form;
}
