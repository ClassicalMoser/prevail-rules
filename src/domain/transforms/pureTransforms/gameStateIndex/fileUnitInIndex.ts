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
  const filed: GameStateIndex = {
    ...index,
    units: { ...index.units, [createUnitIndexKey(unit)]: entry },
  };
  return filed;
}
