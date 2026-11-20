import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import {
  arrayWithoutUnit,
  deriveGameStateIndex,
  hasUnitInArray,
} from '@queries';

/**
 * Takes a unit out of reserve as it is placed at setup. The unit is placed on
 * the board first, so the index, set afresh from the record, now finds it
 * only there.
 *
 * @param gameState - The game, with the unit still in reserve
 * @param unit - The unit leaving reserve
 * @returns The state without the unit in reserve, and its index
 * @throws When the unit is not in reserve
 */
export function removeUnitFromReserve<S extends GameState>(
  gameState: S,
  unit: UnitInstance,
): S {
  // Only a unit still waiting in reserve can leave it.
  if (!hasUnitInArray(gameState.reservedUnits, unit)) {
    throw new Error('Unit not present in reserve');
  }

  // The reserve without it.
  const newReservedUnits = arrayWithoutUnit(gameState.reservedUnits, unit);
  const withoutUnit: S = {
    ...gameState,
    reservedUnits: newReservedUnits,
  };

  // Where every piece now is, read from the record just written.
  const updated: S = {
    ...withoutUnit,
    index: deriveGameStateIndex(withoutUnit),
  };
  return updated;
}
