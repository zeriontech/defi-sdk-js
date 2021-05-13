export function formatNumber(value: number | null): string {
  return value == null ? "-" : new Intl.NumberFormat("en").format(value);
}
