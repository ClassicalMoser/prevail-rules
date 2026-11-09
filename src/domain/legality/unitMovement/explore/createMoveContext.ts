import type { UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import type { MoveContext } from './moveContext';
import { getCurrentUnitStat, getSpacesBehind } from '@queries';

/**
 * Settles the context a move is bound by, at the moment the move begins.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The unit and its starting position
 * @param direction - The direction of movement: 'advance' or 'retreat'
 * @returns The context every step and turn of the move is judged in
 * @throws Error when the direction is neither 'advance' nor 'retreat'
 */
export function createMoveContext(
  gameState: GameState,
  unitWithPlacement: UnitWithPlacement,
  direction: 'advance' | 'retreat',
): MoveContext {
  // The type names the two directions, but a caller outside the type system
  // (a test, a wire payload) still gets a clear fault rather than a walk
  // that silently explores nothing.
  if (direction !== 'advance' && direction !== 'retreat') {
    throw new Error('Invalid direction');
  }

  const { placement: start, unit } = unitWithPlacement;

  // The move's whole budget is sampled here, once, where the move begins
  // (§5.1.4): a round effect's reach is read from the start space and is
  // neither lost nor gained by where the unit walks.
  const totalSpeed = getCurrentUnitStat(unit, 'speed', gameState);
  const totalFlexibility = getCurrentUnitStat(unit, 'flexibility', gameState);

  // The retreat region is computed for advances too; it is cheap, and an
  // advance simply never consults it.
  const retreatSpaces = getSpacesBehind(
    gameState.boardState,
    start.coordinate,
    start.facing,
  );

  const context: MoveContext = {
    direction,
    gameState,
    retreatSpaces,
    start,
    totalFlexibility,
    totalSpeed,
    unitSide: unit.playerSide,
  };
  return context;
}
