import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { deriveGameStateIndex, hasUnitInArray } from '@queries';

/**
 * Records a unit as routed: out of the game for good. The unit leaves the
 * board in the same rout, so the index, set afresh from the record, follows
 * wherever the record now puts it.
 *
 * @param gameState - The game as the unit routs
 * @param unit - The unit routing
 * @returns The state with the unit among the routed, and its index
 * @throws When the unit is already routed
 */
export function addUnitToRouted<S extends GameState>(
  gameState: S,
  unit: UnitInstance,
): S {
  // A unit routs once; it is out of the game after that.
  if (hasUnitInArray(gameState.routedUnits, unit)) {
    throw new Error('Unit already routed');
  }

  // The routed units with it added.
  const withRouted: S = {
    ...gameState,
    routedUnits: [...gameState.routedUnits, unit],
  };

  // Where every piece now is, read from the record just written.
  const updated: S = {
    ...withRouted,
    index: deriveGameStateIndex(withRouted),
  };
  return updated;
}
