import type { UnitInstance, UnitPlacement } from '@entities';
import type { GameState } from '@game';
import { findUnitWithPlacementOnBoard } from './findUnitWithPlacementOnBoard';

/**
 * Where a unit stands on the board, or `undefined` when it is not on it.
 *
 * A unit may leave the board while it is still listed to act: one routed
 * earlier in the phase is gone but its order is still pending. Not being on the
 * board is an ordinary answer, so this is total. Callers that know the unit
 * must be there use `getPositionOfUnit`.
 *
 * The space comes from the game state's index, which every write keeps in
 * step with the board, so the board is not searched. Which way the unit faces
 * is the space's to say: a lone unit faces as stored, and of two engaged units
 * the primary keeps its stored facing and the secondary faces opposite it.
 *
 * TODO(misleading): this answers a `UnitPlacement`, the space and the facing,
 * so "position" says less than it returns. Settled by a name that says
 * placement, with `getPositionOfUnit` and `findPlayerUnitWithPosition`.
 *
 * @param gameState - The game, for its index and its board
 * @param unit - The unit to find
 * @returns The unit's placement (coordinate and facing), or `undefined` when it is not on the board
 * @throws {Error} If the index puts the unit on a space that does not hold it
 */
export function findPositionOfUnit(
  gameState: GameState,
  unit: UnitInstance,
): UnitPlacement | undefined {
  // The unit on the board, if it stands there; its placement is the answer.
  const found = findUnitWithPlacementOnBoard(gameState, unit);
  const placement = found?.placement;
  return placement;
}
