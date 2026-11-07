import type { GameState, ReverseState } from '@game';
import { getBoardSpace, getPositionOfUnit, hasEngagedUnits } from '@queries';

/**
 * Checks if a unit can be reversed in the current game state.
 * A unit cannot be reversed if it is still engaged with an opponent.
 *
 * @param reverseState - The reverse state to check
 * @param gameState - The game state
 * @returns True if the unit can be reversed, false if units are still engaged
 * @throws Error if the unit is no longer on the board
 */
export function canReverseUnit(
  reverseState: ReverseState,
  gameState: GameState,
): boolean {
  // The reverse can come due after a retreat has moved the unit, so the square
  // to judge is where the unit stands now, not where the attack found it.
  const placement = getPositionOfUnit(
    gameState.boardState,
    reverseState.reversingUnit,
  );
  const boardSpace = getBoardSpace(gameState.boardState, placement.coordinate);

  // A unit still locked with an opponent cannot turn to face away from it.
  const engaged = hasEngagedUnits(boardSpace.unitPresence);
  const canReverse = !engaged;
  return canReverse;
}
