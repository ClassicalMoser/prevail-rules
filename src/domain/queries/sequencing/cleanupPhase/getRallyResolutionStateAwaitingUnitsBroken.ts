import type { Board } from '@entities';
import type { GameStateWithBoard, RallyResolutionState } from '@game';
import { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

/**
 * Rally resolution state for the current resolve-rally step after the rally burn effect has been
 * applied, but before `resolveUnitsBroken` has populated `unitsLostSupport`.
 *
 * Panicky narrowing for {@link applyResolveUnitsBrokenEvent}.
 *
 * @param state - The current game state
 * @param player - The player whose broken units are being resolved (must match the cleanup step)
 * @throws Error if wrong step/player, rally not resolved yet, or units-broken already applied
 */
export function getRallyResolutionStateAwaitingUnitsBroken<
  TBoard extends Board,
>(state: GameStateWithBoard<TBoard>, player: 'white' | 'black'): RallyResolutionState {
  const rallyState = getRallyResolutionStateForCurrentStep(state, player);
  if (!rallyState.rallyResolved) {
    throw new Error('Rally has not been resolved yet');
  }
  if (rallyState.unitsLostSupport !== undefined) {
    throw new Error('Units lost support already resolved');
  }
  return rallyState;
}
