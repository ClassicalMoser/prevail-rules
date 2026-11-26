import { createOpenedPlayCardsPhaseState } from '@factories';
import type { PlayCardsPhaseState } from '@game';

/**
 * Phase 1 as a round opens, with what a spec sets beyond that.
 *
 * @param overrides - A later step, such as the reveal
 * @returns The Play Cards phase, to put in a game with `updatePhaseState`
 */
export function createPlayCardsPhaseState(
  overrides?: Partial<PlayCardsPhaseState>,
): PlayCardsPhaseState {
  // Phase 1 as it opens: both players choose a card face down at once
  // (§4.1.1). A spec at a later step, such as the reveal, names it.
  const playCards: PlayCardsPhaseState = {
    ...createOpenedPlayCardsPhaseState(),
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return playCards;
}
