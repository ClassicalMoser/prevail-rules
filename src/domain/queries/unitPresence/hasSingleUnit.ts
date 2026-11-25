import type { SingleUnitPresence, UnitPresence } from '@entities';

/**
 * Type guard to check if a unit presence has a single unit.
 *
 * @param unitPresence - The unit presence to check
 * @returns True if the unit presence has a single unit, false otherwise
 */
export function hasSingleUnit(
  unitPresence: UnitPresence,
): unitPresence is SingleUnitPresence {
  // One unit, standing alone and free of any fight.
  return unitPresence.presenceType === 'single';
}
