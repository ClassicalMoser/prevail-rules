import type { GameState, RallyResolutionState } from '@game';
import { getCleanupPhaseState } from '../phases/getCleanupPhaseState';
import { getRallyingPlayer } from './cleanupPhase/getRallyingPlayer';
import { getRallyResolutionState } from './getRallyResolutionState';

/**
 * The rally being resolved on the current cleanup step: the rallying
 * player's rally, on one of the two resolve steps.
 *
 * @param state - The game state
 * @returns The rally resolution state for the current step
 * @throws Error if not on a resolveRally step, or that rally has not begun
 */
export function getCurrentRallyResolutionState(
  state: GameState,
): RallyResolutionState {
  // A rally is carried out on its player's resolve step; on a choose step it
  // has not begun, and before or after both rallies there is none.
  const { step } = getCleanupPhaseState(state);
  if (
    step !== 'firstPlayerResolveRally' &&
    step !== 'secondPlayerResolveRally'
  ) {
    throw new Error(`Not in a resolveRally step: ${step}`);
  }
  // The resolve step belongs to one player, and it is their rally.
  const rallyState = getRallyResolutionState(state, getRallyingPlayer(state));
  return rallyState;
}
