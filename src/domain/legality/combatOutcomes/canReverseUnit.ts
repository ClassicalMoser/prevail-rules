import type { GameState, ReverseState } from '@game';
import { getBoardSpace, getPositionOfUnit, hasEngagedUnits } from '@queries';

/**
 * Checks if a unit can be reversed in the current game state.
 * A unit cannot be reversed if it is still engaged with an opponent.
 *
 * The reverse is checked at the moment it comes due (§7.5.5, §9.2.3): a unit
 * whose enemy has fallen back or been removed is free, and turns; one still
 * sharing its space with an enemy stays as it is. `generateResolveReverseEvent`
 * asks this to decide which facing its event records.
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
  const placement = getPositionOfUnit(gameState, reverseState.reversingUnit);
  const boardSpace = getBoardSpace(gameState.boardState, placement.coordinate);

  // A unit still locked with an opponent cannot turn to face away from it.
  // TODO(misleading): the line above gives a physical reason. §7.5.5 gives
  // the rule's: while engaged the two units are in the same situation and
  // neither is yet worse off, and §9.2 says a reverse is not an about-face in
  // meaning. Settle whether the comment should carry that reason instead.
  const engaged = hasEngagedUnits(boardSpace.unitPresence);
  const canReverse = !engaged;

  // True when nothing shares the unit's space any more, so the blow it took
  // shows on the battlefield.
  return canReverse;
}
