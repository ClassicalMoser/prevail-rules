import type { UnitInstance } from '@entities';

/**
 * One string that tells a unit apart from every other on the board: its side,
 * its unit type and its instance number. Two units with the same key are the
 * same unit, exactly as `isSameUnitInstance` judges them.
 *
 * A unit is named by identity, and where it stands is read from the board.
 * The key lets that read be a lookup in `getUnitPlacementsOnBoard` rather than
 * a walk past every space comparing units.
 *
 * @param unit - The unit to name
 * @returns Its side, type and instance number, joined
 */
export function getUnitIdentityKey(unit: UnitInstance): string {
  // The same three parts `isSameUnitInstance` compares, so the key and the
  // comparison cannot disagree about which unit is which.
  const key = `${unit.playerSide}|${unit.unitType.id}|${unit.instanceNumber}`;
  return key;
}
