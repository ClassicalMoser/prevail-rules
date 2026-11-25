import type { GameState, PlayCardsPhaseState } from '@game';
import { getCurrentPhaseState } from './getCurrentPhaseState';

/**
 * Gets the play cards phase state from the game state.
 * Throws when the current phase is anything else.
 *
 * @param state - The game state
 * @returns The play cards phase state
 * @throws Error if not in playCards phase or phase state is missing
 */
export function getPlayCardsPhaseState<S extends GameState>(
  state: S,
): PlayCardsPhaseState {
  // The phase the round is in; before the round begins there is none.
  const phaseState = getCurrentPhaseState(state);

  // A caller reading Phase 1, where both players choose a card and initiative is settled (§4.1) outside it has asked out of turn.
  if (phaseState.phase !== 'playCards') {
    throw new Error(`Expected playCards phase, got ${phaseState.phase}`);
  }

  // The play cards phase, with its step and what it holds.
  return phaseState;
}
