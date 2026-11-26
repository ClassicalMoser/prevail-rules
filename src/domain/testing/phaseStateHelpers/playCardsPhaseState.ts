import type { PlayCardsPhaseState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

/**
 * Creates a PlayCardsPhaseState with sensible defaults.
 */
export function createPlayCardsPhaseState(
  overrides?: Partial<PlayCardsPhaseState>,
): PlayCardsPhaseState {
  return {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
    ...overrides,
  };
}
