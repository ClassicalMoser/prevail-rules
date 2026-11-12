import type { Restrictions, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { NO_INSPIRATION_RANGE } from '@ruleValues';
import { findCommanderSpace } from '../board/findCommanderSpace';
import { getSpacesApart } from '../board/getSpacesApart';
import { getPositionOfUnit } from '../unitPresence/getPositionOfUnit';

/**
 * Whether a card's inspiration range reaches a unit (§4.2.7): the unit must
 * stand within that many spaces of its own commander. A range printed as
 * unrestricted (`NO_INSPIRATION_RANGE`) reaches every unit wherever it
 * stands, and a commander who has fallen reaches no one (§4.2.8).
 *
 * Asked when a command is issued and every time a round effect's stat is read,
 * so one rule serves both. Because it is asked so often, the distance is
 * worked out from the two spaces directly rather than by listing every space
 * in reach.
 *
 * @param unit - The unit on the board.
 * @param restrictions - The card's restrictions, of which only the range is read.
 * @param gameState - The game, for the commander and where the unit stands.
 * @returns Whether the range reaches the unit.
 * @throws When the range is a distance and the unit is not on the board.
 */
export function unitMatchesInspirationRange(
  unit: UnitInstance,
  restrictions: Restrictions,
  gameState: GameState,
): boolean {
  const { inspirationRangeRestriction } = restrictions;
  // A range printed as "—" reaches every unit (§4.2.7).
  if (inspirationRangeRestriction <= NO_INSPIRATION_RANGE) {
    return true;
  }
  const board = gameState.boardState;
  const commanderSpace = findCommanderSpace(unit.playerSide, board);
  // A fallen commander inspires no one, so the range fails.
  if (commanderSpace === undefined) {
    return false;
  }
  const { coordinate } = getPositionOfUnit(board, unit);
  // Within range means no more spaces from the commander than the card prints.
  const reached =
    getSpacesApart(board, commanderSpace, coordinate) <=
    inspirationRangeRestriction;
  return reached;
}
