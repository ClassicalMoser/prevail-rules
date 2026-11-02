import type { GameState } from '@game';
import { getCleanupPhaseState } from '@queries/sequencing/phases/getCleanupPhaseState';

/**
 * Gets the next step after resolving rally for the current step.
 *
 * The first player's resolve is followed by the second player's choose.
 * The only other resolve is the second player's, which is followed by complete.
 *
 * @param state - The game state
 * @returns The next step to transition to
 */
export function getNextStepForResolveRally(
  state: GameState,
): 'secondPlayerChooseRally' | 'complete' {
  const phaseState = getCleanupPhaseState(state);

  if (phaseState.step === 'firstPlayerResolveRally') {
    return 'secondPlayerChooseRally';
  }

  return 'complete';
}
