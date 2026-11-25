import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { getOtherPlayer, isFriendlyUnit } from '@queries';

/**
 * Round 0 is setup (`currentPhaseState === 'none'`). Each side places its whole
 * army in one `setupUnits`, the side with the initiative first and then the
 * other (§3.5); on a bare board that is White, which holds the initiative going
 * into round one (§3.3.2). Once neither side has a unit in reserve, round 0
 * ends with `roundEnd`, which begins round 1.
 *
 * @param state - Game state with phase `'none'`
 * @returns The next side's `setupUnits`, or the end of round 0
 */
export function getExpectedSetupEvent(state: GameState): ExpectedEventInfo {
  // The side with the initiative sets up first, then the other.
  const firstPlayer = state.currentInitiative;
  const deploymentOrder = [firstPlayer, getOtherPlayer(firstPlayer)];

  for (const player of deploymentOrder) {
    // Before deployment a side's whole army waits in reserve, so a side with
    // anything still there has not yet placed its army (§3.5.1).
    // TODO(composition): "this side's units in reserve" is also filtered by
    // hand in `getLegalSetupUnits` and `findWinnerFromNoUnits`. Settle with
    // one reader in `@queries` that all three ask.
    const hasUnitsToPlace = state.reservedUnits.some((unit) =>
      isFriendlyUnit(unit, player),
    );

    // The first side in that order still holding a reserve places its whole
    // army now, in one choice; `getLegalSetupUnits` offers it the units and
    // the spaces of its zone.
    if (hasUnitsToPlace) {
      const placeArmy: ExpectedEventInfo = {
        actionType: 'playerChoice',
        choiceType: 'setupUnits',
        playerSource: player,
      };
      return placeArmy;
    }
  }

  // Both armies are on the board: round 0 is over.
  // The round's end is its own effect, and it is what begins round 1
  // (DESIGN.md, "Rounds").
  const endSetup: ExpectedEventInfo = {
    actionType: 'gameEffect',
    effectType: 'roundEnd',
  };
  return endSetup;
}
