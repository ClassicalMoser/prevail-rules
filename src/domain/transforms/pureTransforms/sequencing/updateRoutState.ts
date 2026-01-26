import type {
  Board,
  GameState,
  RoutState,
} from '@entities';
import { updateAttackApplySubstep } from './attackApplyContext';

/**
 * Creates a new game state with the rout state updated in an attack apply state.
 * Handles both ranged attack resolution (issueCommands phase) and melee resolution (resolveMelee phase).
 * Uses queries internally to navigate to the rout state.
 *
 * @param state - The current game state
 * @param routState - The new rout state to set
 * @returns A new game state with the updated rout state
 *
 * @example
 * ```ts
 * const newState = updateRoutState(state, {
 *   substepType: 'rout',
 *   player: 'white',
 *   unitsToRout: new Set([unit]),
 *   numberToDiscard: 2,
 *   cardsChosen: false,
 *   completed: false,
 * });
 * ```
 */
export function updateRoutState<TBoard extends Board>(
  state: GameState<TBoard>,
  routState: RoutState,
): GameState<TBoard> {
  return updateAttackApplySubstep(
    state,
    (attackApplyState) => {
      if (!attackApplyState.routState) {
        throw new Error('No rout state found in attack apply state');
      }
      return {
        ...attackApplyState,
        routState,
      };
    },
    (rout) => rout.player,
    routState,
  );
}
