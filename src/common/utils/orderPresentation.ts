export function formatOrderDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("az-AZ");
}

export function formatOrderDateTime(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("az-AZ");
}

export function formatOrderIdentifier(
  id?: string,
  orderNumber?: string,
): string {
  return `#${orderNumber || id || "-"}`;
}

export function formatOrderAddress(address?: string): string {
  return address || "Ünvan qeyd olunmayıb";
}
