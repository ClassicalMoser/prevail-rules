import type { Board, GameState, RallyResolutionState } from '@entities';
import { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

/**
 * Rally resolution state for the current resolve-rally step when the player has chosen to rally
 * but the burn / return-cards effect has not been applied yet.
 *
 * Panicky narrowing for {@link applyResolveRallyEvent}; procedure is assumed to have enforced order.
 *
 * @param state - The current game state
 * @param player - The player resolving the rally (must match the cleanup step)
 * @throws Error if wrong step/player, player did not choose to rally, or rally already resolved
 */
export function getRallyResolutionStateAwaitingBurn<TBoard extends Board>(
  state: GameState<TBoard>,
  player: 'white' | 'black',
): RallyResolutionState {
  const rallyState = getRallyResolutionStateForCurrentStep(state, player);
  if (!rallyState.playerRallied) {
    throw new Error('Player did not choose to rally');
  }
  if (rallyState.rallyResolved) {
    throw new Error('Rally has already been resolved');
  }
  return rallyState;
}
