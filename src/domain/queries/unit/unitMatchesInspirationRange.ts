import type { Restrictions, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { getSpacesWithinDistance } from '../board/areas/getSpacesWithinDistance';
import { getCommanderSpace } from '../board/getCommanderSpace';
import { getPositionOfUnit } from '../unitPresence/getPositionOfUnit';

/**
 * Whether a card's inspiration range reaches a unit (§4.2.7): the unit must
 * stand within that many spaces of its own commander. A range printed as
 * unrestricted (stored as a negative number) reaches every unit wherever it
 * stands, and a commander who has fallen reaches no one (§4.2.8).
 *
 * Asked when a command is issued and every time a round effect's stat is read,
 * so one rule serves both.
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
  // No restriction: every unit is within reach.
  if (inspirationRangeRestriction < 0) {
    return true;
  }
  const commanderSpace = getCommanderSpace(
    unit.playerSide,
    gameState.boardState,
  );
  // A fallen commander inspires no one, so the range fails.
  if (commanderSpace === undefined) {
    return false;
  }
  const spacesWithinDistance = getSpacesWithinDistance(
    gameState.boardState,
    commanderSpace,
    inspirationRangeRestriction,
  );
  const { coordinate } = getPositionOfUnit(gameState.boardState, unit);
  return spacesWithinDistance.has(coordinate);
}
