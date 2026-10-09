/** Serialize JSON-LD for an HTML script element without allowing HTML tags. */
export function serializeJsonLd(value: unknown): string {
  const serialized = JSON.stringify(value);

  if (serialized === undefined) {
    throw new TypeError("JSON-LD value must be JSON serializable");
  }

  return serialized.replace(/</g, "\\u003c");
}
