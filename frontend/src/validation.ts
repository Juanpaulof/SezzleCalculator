const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)$/;

export type ParseResult = { ok: true; value: number } | { ok: false; error: string };

/** Validates a raw text input and converts it to a number. */
export function parseOperand(raw: string, label: string): ParseResult {
  const text = raw.trim();
  if (text === "") {
    return { ok: false, error: `${label} is required` };
  }
  if (!NUMBER_PATTERN.test(text)) {
    return { ok: false, error: `${label} must be a valid number` };
  }
  const value = Number(text);
  if (!Number.isFinite(value)) {
    return { ok: false, error: `${label} is too large` };
  }
  return { ok: true, value };
}
