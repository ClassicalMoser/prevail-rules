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
  const phaseState = getMoveCommandersPhaseState(state);
  const updated = updatePhaseState(state, { ...phaseState, step });
  return updated;
}
