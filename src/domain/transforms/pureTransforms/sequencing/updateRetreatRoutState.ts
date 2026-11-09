import type { GameState, RetreatState, RoutState } from '@game';
import { getRetreatState } from '@queries';
import { updateRetreatState } from './updateRetreatState';

/**
 * Creates a new game state with the rout state updated within a retreat state.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * A completed rout completes the retreat that holds it.
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
export function updateRetreatRoutState<S extends GameState>(
  state: S,
  routState: RoutState,
): S {
  const currentRetreat: RetreatState = getRetreatState(state, routState.player);
  // A retreat whose rout is settled has nothing left to do: the unit has
  // left, so the retreat closes with its rout (§9.1.6).
  const newState = updateRetreatState(state, {
    ...currentRetreat,
    completed: routState.completed ? true : currentRetreat.completed,
    routState,
  });
  return newState;
}
