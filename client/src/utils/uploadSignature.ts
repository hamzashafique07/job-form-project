export async function uploadSignatureToDrive(signatureBase64: string) {
  if (!signatureBase64) return null;

  const res = await fetch("/api/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signatureBase64 }),
  });

  if (!res.ok) throw new Error("Upload failed");

  const body = await res.json();
  return body.signatureFileUrl;
}
