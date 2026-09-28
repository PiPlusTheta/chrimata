// Accounting convention: negative amounts render in parentheses, e.g. (₹1.20 L),
// rather than a leading minus sign — the standard financial-statement format.
export function formatPaise(paise?: number | null): string {
  if (paise == null) return "—";
  const negative = paise < 0;
  const abs = Math.abs(paise);
  let text: string;
  if (abs >= 1_000_000_000) text = `₹${(abs / 1_000_000_000).toFixed(2)} Cr`;
  else if (abs >= 10_000_000) text = `₹${(abs / 10_000_000).toFixed(2)} L`;
  else text = `₹${(abs / 100).toLocaleString("en-IN")}`;
  return negative ? `(${text})` : text;
}

// Renders a claim's original foreign-currency figure alongside its INR
// normalization, e.g. "USD 10,000.00 (≈ ₹8.75 L)". Falls back to the plain INR
// figure when the claim has no foreign-currency metadata.
export function formatClaimAmount(claim: {
  stated_amount_paise?: number | null;
  currency_code?: string | null;
  original_amount_minor?: number | null;
}): string {
  const inr = formatPaise(claim.stated_amount_paise);
  if (!claim.currency_code || claim.currency_code === "INR" || claim.original_amount_minor == null) {
    return inr;
  }
  const original = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: claim.currency_code,
  }).format(claim.original_amount_minor / 100);
  return `${original} (≈ ${inr})`;
}
