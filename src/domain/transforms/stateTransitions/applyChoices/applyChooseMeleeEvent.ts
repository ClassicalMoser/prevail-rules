import type { ChooseMeleeResolutionEvent } from '@events';
import type { GameState } from '@game';
import { openMeleeResolution } from '@transforms/pureTransforms';

/** Applies the choose melee resolution event to the game state.
 * Active player chooses a space with engaged units to resolve the melee.
 *
 * @param event - The choose melee resolution event to apply
 * @param state - The current game state
 * @returns A new game state with the melee resolution updated
 */
export function applyChooseMeleeEvent<S extends GameState>(
  event: ChooseMeleeResolutionEvent,
  state: S,
): S {
  // Fight the chosen engagement next (§4.4.2).
  const opened = openMeleeResolution(state, event.space);
  return opened;
}
