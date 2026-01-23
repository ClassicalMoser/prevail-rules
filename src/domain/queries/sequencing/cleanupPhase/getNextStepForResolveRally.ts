import type { Board, CleanupPhaseState, GameState } from '@entities';
import { getCleanupPhaseState } from '../getPhaseState';

/**
 * Gets the next step after resolving rally for the current step.
 *
 * @param state - The game state
 * @returns The next step to transition to
 * @throws Error if not in a resolveRally step
 */
export function getNextStepForResolveRally<TBoard extends Board>(
  state: GameState<TBoard>,
): CleanupPhaseState['step'] {
  const phaseState = getCleanupPhaseState(state);

  if (phaseState.step === 'firstPlayerResolveRally') {
    return 'secondPlayerChooseRally';
  }

  if (phaseState.step === 'secondPlayerResolveRally') {
    return 'complete';
  }

  throw new Error(
    `Cleanup phase is not on a resolveRally step: ${phaseState.step}`,
  );
}
