import type { GameState, RetreatState, RoutState } from '@game';
import { getRetreatState } from '@queries';
import { updateRetreatState } from './updateRetreatState';

/**
 * Creates a new game state with the rout state updated within a retreat state.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * It writes the rout only; the retreat holding it closes in `settleRout`.
 * Uses composed retreat-state query and updateRetreatState to avoid repetition.
 *
 * TODO(misleading): the example below is out of date. `unitsToRout` is an
 * array, not a `Set`, and `numberToDiscard` is `'pending'` until the penalty
 * is worked out, never `undefined`. Settled by rewriting it from
 * `createOpenedRoutState`, which `applyTriggerRoutFromRetreatEvent` uses.
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
  // A unit that must retreat and cannot routs instead (§9.1.6), and the
  // retreat holds that rout. The routing player names the retreat: in a
  // melee each side may be falling back. With none for them, this throws.
  const currentRetreat: RetreatState = getRetreatState(state, routState.player);

  // The rout goes inside that retreat, wherever the retreat itself sits; the
  // retreat stays open until the rout is paid.
  const newState = updateRetreatState(state, {
    ...currentRetreat,
    routState,
  });

  // The retreat, holding the rout as it now stands.
  return newState;
}
