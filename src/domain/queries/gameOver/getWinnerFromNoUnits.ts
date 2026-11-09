import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

import { getPlayerUnitsOnBoard } from '../unit/getPlayerUnitsOnBoard';
import { isFriendlyUnit } from '../unit/isFriendlyUnit';

/**
 * No-units loss rule (§11.4): a player whose army is destroyed to the last
 * unit loses immediately, however many cards they hold. It will almost never
 * come up; it exists to close the door on feeding an army to the enemy in
 * order to cycle a small hand indefinitely. `undefined` means the game
 * continues.
 *
 * @param state - The current game state.
 * @returns Winning side, or `undefined` if the game continues.
 */
export function getWinnerFromNoUnits(state: GameState): PlayerSide | undefined {
  // An army is in the game while any of it stands on the board or still
  // waits in reserve: during setup nothing has been fielded yet, and an
  // army not yet fielded is not a destroyed one.
  const whiteHasArmy =
    getPlayerUnitsOnBoard(state, 'white').size > 0 ||
    state.reservedUnits.some((unit) => isFriendlyUnit(unit, 'white'));
  const blackHasArmy =
    getPlayerUnitsOnBoard(state, 'black').size > 0 ||
    state.reservedUnits.some((unit) => isFriendlyUnit(unit, 'black'));

  // Only a destroyed army loses. A board with no armies at all is a game
  // not yet begun, not a defeat — and in play both armies can never vanish
  // in the same instant, because routs are carried out one at a time.
  if (!whiteHasArmy && blackHasArmy) {
    return 'black';
  }
  if (!blackHasArmy && whiteHasArmy) {
    return 'white';
  }
  return undefined;
}
