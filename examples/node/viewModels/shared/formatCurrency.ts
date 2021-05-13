export function formatCurrency(value: number | null, currency: string): string {
  return value == null
    ? "-"
    : new Intl.NumberFormat("en", { style: "currency", currency }).format(
        value
      );
}
