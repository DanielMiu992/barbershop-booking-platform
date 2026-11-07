export interface StarRatingThresholds {
  low: number;
  high: number;
}

export function roundForStarDisplay(
  value: number,
  thresholds: StarRatingThresholds = { low: 0.3, high: 0.7 }
): number {
  const floorValue = Math.floor(value);
  const fraction = value - floorValue;

  if (fraction < thresholds.low) return floorValue;
  if (fraction <= thresholds.high) return floorValue + 0.5;
  return floorValue + 1;
}

export function getStarIconClass(displayValue: number, position: number): string {
  if (displayValue >= position) return 'fa-solid fa-star';
  if (displayValue >= position - 0.5) return 'fa-solid fa-star-half-stroke';
  return 'fa-regular fa-star';
}