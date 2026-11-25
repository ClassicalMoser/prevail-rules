import type { GameState, PlayCardsPhaseStep } from '@game';
import { getPlayCardsPhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Moves the play cards phase to a step: the cards are chosen, revealed, and
 * initiative assigned (§4.1).
 *
 * @param state - The game state, playing cards
 * @param step - The step to move to
 * @returns The game state on that step
 */
export function updatePlayCardsStep<S extends GameState>(
  state: S,
  step: PlayCardsPhaseStep,
): S {
  // Cards are played only in Phase 1; asked elsewhere, this throws.
  const phaseState = getPlayCardsPhaseState(state);

  // Both players choose face down, then the cards are turned over together
  // and initiative assigned (§4.1.1–§4.1.3); the caller names the step that
  // follows.
  const updated = updatePhaseState(state, { ...phaseState, step });

  // Phase 1 on that step.
  return updated;
}
