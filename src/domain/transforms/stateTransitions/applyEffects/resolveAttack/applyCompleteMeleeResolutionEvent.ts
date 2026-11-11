import type { CompleteMeleeResolutionEvent } from '@events';
import type { GameState } from '@game';
import { clearMeleeResolution } from '@transforms/pureTransforms';

/**
 * Applies a CompleteMeleeResolutionEvent to the game state.
 * Clears the currentMeleeResolutionState and allows the phase to continue
 * to the next engagement or complete.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the melee resolution state cleared
 */
export function applyCompleteMeleeResolutionEvent<S extends GameState>(
  _event: CompleteMeleeResolutionEvent,
  state: S,
): S {
  // The melee is finished; the next may be chosen (§4.4.2).
  const cleared = clearMeleeResolution(state);
  return cleared;
}
