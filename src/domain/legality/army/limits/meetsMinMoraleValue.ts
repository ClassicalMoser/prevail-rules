/**
 * Whether a list carries at least its mode's total Morale (§3.1.6): somebody
 * in it has to matter, so an army of cheap, worthless troops cannot be built.
 * A mode with no floor (Tutorial) allows any Morale.
 *
 * @param moraleValue - The list's total Morale, counting each copy
 * @param minMoraleValue - The mode's floor, or `null` where it sets none
 * @returns Whether the list reaches the floor
 */
export function meetsMinMoraleValue(
  moraleValue: number,
  minMoraleValue: number | null,
): boolean {
  // Tutorial sets no floor, so any Morale will do; otherwise the list must
  // reach the floor, and reaching it exactly is enough (§3.1.6).
  const meetsFloor = minMoraleValue === null || moraleValue >= minMoraleValue;

  // Whether somebody in the list matters enough.
  return meetsFloor;
}
