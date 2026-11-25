/**
 * Whether a list costs no more than its mode's cap (§3.1.3): every unit,
 * counting each copy, and every card, bought from the same points. A mode
 * with no cap (Tutorial) allows any cost.
 *
 * @param armyCost - What the list costs, units and cards together
 * @param maxArmyCost - The mode's cap, or `null` where it sets none
 * @returns Whether the list keeps to the cap
 */
export function isWithinMaxArmyCost(
  armyCost: number,
  maxArmyCost: number | null,
): boolean {
  // Tutorial sets no cap, so any cost will do; otherwise a list may spend the
  // whole cap and not a point more.
  const withinCap = maxArmyCost === null || armyCost <= maxArmyCost;

  // Whether the list could be bought with the mode's points.
  return withinCap;
}
