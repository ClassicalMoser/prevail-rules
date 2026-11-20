import type { UnitInstance } from '@entities';
import type { UnitIndexKey } from '@game';

/**
 * The key a unit is filed under in the game state's index: its side, its
 * type's id and its number, as `white-<type id>-2`.
 *
 * Those three are exactly what `isSameUnitInstance` compares, so two units
 * share a key only when they are the same unit, wherever each copy of it was
 * read from.
 *
 * @param unit - The unit to name
 * @returns The unit's key in the index
 */
export function createUnitIndexKey(unit: UnitInstance): UnitIndexKey {
  const key: UnitIndexKey = `${unit.playerSide}-${unit.unitType.id}-${unit.instanceNumber}`;
  return key;
}
