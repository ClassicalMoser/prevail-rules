import type { PlayCardsPhaseState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';

/**
 * Phase 1 as a round opens: both players choose a card face down at once
 * (§4.1.1).
 *
 * @returns The Play Cards phase, on its first step
 */
export function createOpenedPlayCardsPhaseState(): PlayCardsPhaseState {
  // Both choose together; the reveal comes once both cards are down.
  const playCards: PlayCardsPhaseState = {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
  };

  // The phase, open and nobody yet having chosen.
  return playCards;
}
