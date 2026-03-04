export function sanitizeContent(input) {
  const raw = String(input ?? "");
  const noTags = raw.replace(/<[^>]*>/g, "");
  const normalized = noTags.replace(/\s+/g, " ").trim();
  return normalized;
}
