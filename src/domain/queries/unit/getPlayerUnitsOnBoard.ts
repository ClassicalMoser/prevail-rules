import type { PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getPlayerUnitsWithPlacementOnBoard } from './getPlayerUnitsWithPlacementOnBoard';

/**
 * Gets all unit instances for a player that are currently on the board.
 *
 * Which units a side has on the board is defined once, by
 * {@link getPlayerUnitsWithPlacementOnBoard}; this is the same answer without
 * where each stands, for a caller that counts or compares units rather than
 * places them.
 *
 * @param state - The current game state
 * @param player - The player whose units to get
 * @returns Set of unit instances on the board belonging to the player
 *
 * @example
 * ```typescript
 * const units = getPlayerUnitsOnBoard(state, 'white');
 * // Returns Set([unitInstance1, unitInstance2, ...])
 * ```
 */
export function getPlayerUnitsOnBoard(
  state: GameState,
  player: PlayerSide,
): Set<UnitInstance> {
  // The units are the same ones, with their placements left behind.
  const placed = getPlayerUnitsWithPlacementOnBoard(state, player);
  return new Set([...placed].map(({ unit }) => unit));
}
