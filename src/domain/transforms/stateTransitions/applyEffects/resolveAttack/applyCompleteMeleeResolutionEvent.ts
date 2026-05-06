import type { Board } from "@entities";
import type { CompleteMeleeResolutionEvent } from "@events";
import type { GameStateForBoard, ResolveMeleePhaseStateForBoard } from "@game";
import { getResolveMeleePhaseStateForBoard } from "@queries";
import { updatePhaseState } from "@transforms/pureTransforms";

/**
 * Applies a CompleteMeleeResolutionEvent to the game state.
 * Clears the currentMeleeResolutionState and allows the phase to continue
 * to the next engagement or complete.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the melee resolution state cleared
 */
export function applyCompleteMeleeResolutionEvent<TBoard extends Board>(
  _event: CompleteMeleeResolutionEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const phaseState = getResolveMeleePhaseStateForBoard(state);

  // Clear the current melee resolution state
  const newPhaseState: ResolveMeleePhaseStateForBoard<TBoard> = {
    ...phaseState,
    currentMeleeResolutionState: undefined,
  };

  return updatePhaseState(state, newPhaseState);
}
