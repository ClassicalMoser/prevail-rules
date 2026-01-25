import type { Board, GameState, ReverseState } from '@entities';
import { hasEngagedUnits, hasNoUnit } from '@entities';
import { getBoardSpace } from '@queries/boardSpace';

/**
 * Checks if a unit can be reversed in the current game state.
 * A unit cannot be reversed if it is still engaged with an opponent.
 *
 * @param reverseState - The reverse state to check
 * @param gameState - The game state
 * @returns True if the unit can be reversed, false if units are still engaged
 * @throws Error if the unit is not present at the coordinate
 */
export function canReverseUnit<TBoard extends Board>(
  reverseState: ReverseState<TBoard>,
  gameState: GameState<TBoard>,
): boolean {
  const coordinate = reverseState.reversingUnit.placement.coordinate;
  const boardSpace = getBoardSpace(gameState.boardState, coordinate);

  // If there's no unit at the coordinate, this is an invalid state
  if (hasNoUnit(boardSpace.unitPresence)) {
    throw new Error('Unit not present at coordinate');
  }

  // If units are still engaged, reverse cannot happen
  return !hasEngagedUnits(boardSpace.unitPresence);
}
