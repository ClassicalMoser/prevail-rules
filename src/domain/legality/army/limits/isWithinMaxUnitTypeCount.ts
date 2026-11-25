/**
 * Whether a list fields no more different unit types than its mode allows
 * (§3.1.3). Every mode sets this limit, Tutorial included.
 *
 * @param unitTypeCount - How many different unit types the list fields
 * @param maxUnitTypeCount - The most the mode allows
 * @returns Whether the list keeps to the limit
 */
export function isWithinMaxUnitTypeCount(
  unitTypeCount: number,
  maxUnitTypeCount: number,
): boolean {
  // A list may field as many types as the mode allows, and no more.
  const withinLimit = unitTypeCount <= maxUnitTypeCount;

  // Whether the list keeps to the mode's variety of troops.
  return withinLimit;
}
