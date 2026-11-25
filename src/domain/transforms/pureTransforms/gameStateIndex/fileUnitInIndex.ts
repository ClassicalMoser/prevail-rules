import type { UnitInstance } from '@entities';
import type { GameStateIndex, UnitIndexEntry } from '@game';
import { createUnitIndexKey } from '@factories';

/**
 * The index with one unit filed afresh: where it now is, every other entry
 * as it was. A shared step of the writers that move a unit, each of which
 * changes the record and files the unit in the same new state; never called
 * on its own, as an index changed apart from its record says something the
 * record does not.
 *
 * @param index - The index as it was
 * @param unit - The unit whose entry changes
 * @param entry - Where it now is: a space, in reserve, or routed
 * @returns A new index with that one entry overwritten
 */
export function fileUnitInIndex(
  index: GameStateIndex,
  unit: UnitInstance,
  entry: UnitIndexEntry,
): GameStateIndex {
  // A unit is filed under its identity, the same key every reader looks it
  // up by.
  const key = createUnitIndexKey(unit);

  // Only that unit's entry changes, so every other unit and both commanders
  // are found where they were.
  const filed: GameStateIndex = {
    ...index,
    units: { ...index.units, [key]: entry },
  };

  // The index with the unit filed where it now is.
  return filed;
}
