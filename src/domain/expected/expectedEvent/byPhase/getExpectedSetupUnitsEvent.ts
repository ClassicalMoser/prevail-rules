import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { isFriendlyUnit } from '@queries';

/**
 * Pre-round deployment (`currentPhaseState === 'none'`): white sets up first,
 * then black, while either side still has {@link GameState.reservedUnits}.
 *
 * Deployment order is white's by rule and does not follow the initiative, which
 * black holds at the start of a game. The asymmetry is deliberate: seeing the
 * opponent deploy is worth something, and so is striking first.
 *
 * @param state - Game state with phase `'none'` and reserved units remaining
 * @returns Expected `setupUnits` choice for the next side to deploy
 * @throws If neither side has reserved units (caller should not invoke then)
 */
export function getExpectedSetupUnitsEvent(
  state: GameState,
): ExpectedEventInfo {
  const whiteNeedsSetup = state.reservedUnits.some((unit) => {
    const belongsToWhite = isFriendlyUnit(unit, 'white');
    return belongsToWhite;
  });
  if (whiteNeedsSetup) {
    return {
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    };
  }

  const blackNeedsSetup = state.reservedUnits.some((unit) => {
    const belongsToBlack = isFriendlyUnit(unit, 'black');
    return belongsToBlack;
  });
  if (blackNeedsSetup) {
    return {
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'black',
    };
  }

  throw new Error('No reserved units remaining for setup');
}
