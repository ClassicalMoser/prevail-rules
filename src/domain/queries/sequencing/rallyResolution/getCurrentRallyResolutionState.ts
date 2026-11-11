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
  const { step } = getCleanupPhaseState(state);
  if (
    step !== 'firstPlayerResolveRally' &&
    step !== 'secondPlayerResolveRally'
  ) {
    throw new Error(`Not in a resolveRally step: ${step}`);
  }
  const rallyState = getRallyResolutionState(state, getRallyingPlayer(state));
  return rallyState;
}
