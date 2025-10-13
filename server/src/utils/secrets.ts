//server/src/utils/secrets.ts
/** @format */

// Simple dev-mode secret resolver
export async function getSecretValue(ref: string): Promise<string> {
  if (!ref) {
    console.warn("⚠️ getSecretValue called with empty ref");
    return "";
  }

  // If your password is stored in env under that ref name, return it
  if (process.env[ref]) return process.env[ref]!;

  // Otherwise, just return ref directly for now (temporary fallback)
  console.warn(`⚠️ No env value found for secret key ref: ${ref}`);
  return ref;
}
