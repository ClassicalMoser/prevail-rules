import type { Board, PlayerSide } from "@entities";
import type { AttackApplyStateForBoard, GameStateForBoard } from "@game";
import { getMeleeResolutionState, getResolveMeleePhaseStateForBoard } from "@queries";
import { updatePhaseState } from "../state";

/**
 * Creates a new game state with the attack apply state updated for a specific player in melee resolution.
 * Uses queries internally to navigate to the attack apply state.
 *
 * @param state - The current game state
 * @param player - The player whose attack apply state to update ('white' or 'black')
 * @param attackApplyState - The new attack apply state to set
 * @returns A new game state with the updated attack apply state
 *
 * @example
 * ```ts
 * const newState = updateMeleeAttackApplyState(state, 'white', {
 *   ...getAttackApplyStateFromMelee(state, 'white'),
 *   completed: true,
 * });
 * ```
 */
export function updateMeleeAttackApplyState<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  player: PlayerSide,
  attackApplyState: AttackApplyStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const resolveMeleePhaseState = getResolveMeleePhaseStateForBoard(state);
  const meleeState = getMeleeResolutionState(state);

  const newMeleeState = {
    ...meleeState,
    ...(player === "white"
      ? { whiteAttackApplyState: attackApplyState }
      : { blackAttackApplyState: attackApplyState }),
  };

  const newPhaseState = {
    ...resolveMeleePhaseState,
    currentMeleeResolutionState: newMeleeState,
  };

  return updatePhaseState(state, newPhaseState);
}
