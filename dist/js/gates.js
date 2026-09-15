// GATE RULE: never blanket-reject/accept an 0x-hex-shaped string on shape alone.
// A gate passes only when the record's state is "stated" AND its value is well-formed.
// This module is imported by both the browser app and the Node gate tests, so a
// throwaway copy string can never accidentally pass — it has to come through the
// registry record itself.

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const URL_RE = /^https:\/\/[^\s]+$/;

export function isAddressShaped(value) {
  return typeof value === "string" && ADDRESS_RE.test(value);
}

export function contractGate(record) {
  if (!record || record.state !== "stated") return false;
  return isAddressShaped(record.address);
}

export function socialGate(record) {
  if (!record || record.state !== "stated") return false;
  return typeof record.url === "string" && URL_RE.test(record.url);
}

export function deriveHandle(url) {
  if (typeof url !== "string") return null;
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : u.hostname;
  } catch {
    return null;
  }
}
