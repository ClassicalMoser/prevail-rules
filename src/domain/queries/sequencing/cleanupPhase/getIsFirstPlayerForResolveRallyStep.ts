import type { Board } from '@entities';
import type { GameStateWithBoard } from '@game';
import { getCleanupPhaseState } from '../getPhaseState';

/**
 * Gets whether the current resolveRally step is for the first player.
 *
 * @param state - The game state
 * @returns Whether it's the first player's step
 * @throws Error if not in a resolveRally step
 */
export function getIsFirstPlayerForResolveRallyStep<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
): boolean {
  const phaseState = getCleanupPhaseState(state);

  if (phaseState.step === 'firstPlayerResolveRally') {
    return true;
  }

  if (phaseState.step === 'secondPlayerResolveRally') {
    return false;
  }

  throw new Error(
    `Cleanup phase is not on a resolveRally step: ${phaseState.step}`,
  );
}
