import type { Board } from '@entities';
import type { GameStateWithBoard, RoutState } from '@game';
import { findRetreatState } from '@queries';
import { updateRetreatState } from './updateRetreatState';

/**
 * Creates a new game state with the rout state updated within a retreat state.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * Uses composed retreat-state query and updateRetreatState to avoid repetition.
 *
 * @param state - The current game state
 * @param routState - The new rout state to set
 * @returns A new game state with the updated rout state
 *
 * @example
 * ```ts
 * const newState = updateRetreatRoutState(state, {
 *   substepType: 'rout',
 *   player: 'white',
 *   unitsToRout: new Set([unit]),
 *   numberToDiscard: undefined,
 *   cardsChosen: false,
 *   completed: false,
 * });
 * ```
 */
export function updateRetreatRoutState<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  routState: RoutState,
): GameStateWithBoard<TBoard> {
  const currentRetreat = findRetreatState(state, routState.player);
  return updateRetreatState(state, { ...currentRetreat, routState });
}
