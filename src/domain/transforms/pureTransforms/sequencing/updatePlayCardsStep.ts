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
  const phaseState = getPlayCardsPhaseState(state);
  const updated = updatePhaseState(state, { ...phaseState, step });
  return updated;
}
