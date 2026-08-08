import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';

/**
 * Pre-round deployment (`currentPhaseState === 'none'`): white sets up first,
 * then black, while either side still has {@link GameState.reservedUnits}.
 *
 * @param state - Game state with phase `'none'` and reserved units remaining
 * @returns Expected `setupUnits` choice for the next side to deploy
 * @throws If neither side has reserved units (caller should not invoke then)
 */
export function getExpectedSetupUnitsEvent(
  state: GameState,
): ExpectedEventInfo {
  const whiteNeedsSetup = state.reservedUnits.some(
    (unit) => unit.playerSide === 'white',
  );
  if (whiteNeedsSetup) {
    return {
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    };
  }

  const blackNeedsSetup = state.reservedUnits.some(
    (unit) => unit.playerSide === 'black',
  );
  if (blackNeedsSetup) {
    return {
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'black',
    };
  }

  throw new Error('No reserved units remaining for setup');
}
