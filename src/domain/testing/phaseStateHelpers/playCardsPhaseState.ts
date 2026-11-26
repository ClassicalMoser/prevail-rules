import type { PlayCardsPhaseState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

/**
 * Creates a PlayCardsPhaseState with sensible defaults.
 */
export function createPlayCardsPhaseState(
  overrides?: Partial<PlayCardsPhaseState>,
): PlayCardsPhaseState {
  // Phase 1 as it opens: both players choose a card face down at once
  // (§4.1.1). A spec at a later step, such as the reveal, names it.
  const playCards: PlayCardsPhaseState = {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return playCards;
}
