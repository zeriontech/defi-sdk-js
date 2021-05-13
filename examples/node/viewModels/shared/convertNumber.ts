export function convertNumber(
  value: string | number,
  decimalPoints: number
): number {
  return Number(value) * 10 ** decimalPoints;
}
