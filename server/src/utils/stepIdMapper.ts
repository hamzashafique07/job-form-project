// server/src/utils/stepIdMapper.ts
export const stepIdMapper: Record<string, string> = {
  hello: "hello",
  "personal-details": "personalDetails",
  "address-lookup": "addressLookup",
  postcode: "addressLookup.postcode", // ⬅️ nested inside addressLookup
  final: "final",
  submit: "final",
};

export function mapStepId(stepId: string): string | undefined {
  return stepIdMapper[stepId];
}
