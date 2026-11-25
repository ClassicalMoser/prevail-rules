import type { CleanupPhaseStep, GameState } from '@game';
import { getCleanupPhaseState } from '@queries/sequencing/phases/getCleanupPhaseState';

/**
 * The cleanup step after a player chooses whether to rally (§10.3). A player
 * who rallies resolves it next; one who declines passes to the second
 * player's choice, or, if they were the second, to the end of the round.
 *
 * @param state - The game state, on a choose-rally step
 * @param performRally - Whether the player chose to rally
 * @returns The step to move to
 * @throws Error when cleanup is not on a choose-rally step
 */
export function getNextStepForChooseRally(
  state: GameState,
  performRally: boolean,
): CleanupPhaseStep {
  const { step } = getCleanupPhaseState(state);

  // The first player resolves their rally, or passes the choice to the second.
  if (step === 'firstPlayerChooseRally') {
    const next: CleanupPhaseStep = performRally
      ? 'firstPlayerResolveRally'
      : 'secondPlayerChooseRally';
    return next;
  }
  // The second player resolves their rally, or the round is over.
  if (step === 'secondPlayerChooseRally') {
    const next: CleanupPhaseStep = performRally
      ? 'secondPlayerResolveRally'
      : 'complete';
    return next;
  }

  // On any other step, no one is choosing whether to rally.
  throw new Error(`Cleanup phase is not on a chooseRally step: ${step}`);
}
