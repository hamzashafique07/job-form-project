export async function queueRetry(leadId, payload, reason) {
  console.log(`🕓 Queued retry for ${leadId} due to: ${reason}`);
}
