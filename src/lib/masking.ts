/**
 * Standard privacy masking for sensitive identification numbers.
 * Example: "11998800234521" -> "119988****521"
 * 
 * Safe for use in both Client Components and Server Routes.
 */
export function maskDocumentNumber(docNumber: string): string {
  if (!docNumber) return "";

  const clean = docNumber.trim().replace(/\s+/g, "");

  if (clean.length <= 4) {
    return "****";
  }

  if (clean.length <= 8) {
    const start = clean.slice(0, 2);
    const end = clean.slice(-2);
    return `${start}****${end}`;
  }

  // Rwandan National ID (16 digits) or Standard Long Document Numbers
  // Pattern: First 6 chars + **** + Last 3 chars -> "119988****521"
  const start = clean.slice(0, 6);
  const end = clean.slice(-3);
  return `${start}****${end}`;
}

