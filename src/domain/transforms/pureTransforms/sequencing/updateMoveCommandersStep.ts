import type { GameState, MoveCommandersPhaseStep } from '@game';
import { getMoveCommandersPhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Moves the commander moves to a step: the first player's commander moves,
 * then the second's, then the phase is done (§4.2.1).
 *
 * @param state - The game state, moving commanders
 * @param step - The step to move to
 * @returns The game state on that step
 */
export function updateMoveCommandersStep<S extends GameState>(
  state: S,
  step: MoveCommandersPhaseStep,
): S {
  // Commanders move only in Phase 2; asked elsewhere, this throws.
  const phaseState = getMoveCommandersPhaseState(state);

  // The first player's commander moves, then the second's (§4.2.1); the
  // caller, having carried out one move or skipped a lost commander's, names
  // the step that follows.
  const updated = updatePhaseState(state, { ...phaseState, step });

  // Phase 2 on that step.
  return updated;
}
