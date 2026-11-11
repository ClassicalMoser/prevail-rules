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
  for (const player of [firstPlayer, getOtherPlayer(firstPlayer)]) {
    const hasUnitsToPlace = state.reservedUnits.some((unit) =>
      isFriendlyUnit(unit, player),
    );
    if (hasUnitsToPlace) {
      return {
        actionType: 'playerChoice',
        choiceType: 'setupUnits',
        playerSource: player,
      };
    }
  }

  // Both armies are on the board: round 0 is over.
  return {
    actionType: 'gameEffect',
    effectType: 'roundEnd',
  };
}
