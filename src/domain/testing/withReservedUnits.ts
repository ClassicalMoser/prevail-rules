import type { UnitInstance } from '@entities';
import type { GameState } from '@game';
import { deriveGameStateIndex } from '@queries';

/**
 * A game state with these units waiting in reserve, each filed there, as a
 * new game holds its army before deployment. For a spec that wants a reserve
 * other than a whole army's.
 *
 * @param state - The game to put the units in reserve in
 * @param units - The units waiting to deploy
 * @returns The state with them in reserve and filed as reserved
 */
export function withReservedUnits<S extends GameState>(
  state: S,
  units: readonly UnitInstance[],
): S {
  // A whole new reserve, so the index is worked out afresh from it and the
  // board alike, as a whole new board's would be.
  const withReserve: S = { ...state, reservedUnits: [...units] };
  const reserved: S = {
    ...withReserve,
    index: deriveGameStateIndex(withReserve),
  };

  // The game, with those units waiting to deploy.
  return reserved;
}
