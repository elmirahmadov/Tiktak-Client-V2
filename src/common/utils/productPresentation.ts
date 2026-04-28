export function resolveProductImage(img?: string | null): string {
  if (!img || !img.trim()) return "/globe.svg";

  const value = img.trim();
  const invalidValues = ["null", "undefined", "test", "none", ""];

  if (invalidValues.includes(value.toLowerCase())) return "/globe.svg";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) return value.startsWith("/") ? value : `/${value}`;

  return value.startsWith("/") ? `${base}${value}` : `${base}/${value}`;
}

export function formatPriceAzn(value: string | number): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return `${value} AZN`;
  return `${numeric.toFixed(2)} AZN`;
}
