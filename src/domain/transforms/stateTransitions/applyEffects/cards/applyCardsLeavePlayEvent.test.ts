import type { CardsLeavePlayEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getCleanupPhaseState } from '@queries';
import {
  createCleanupPhaseState,
  createResolveMeleePhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import {
  projectGameStateForVisibility,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyCardsLeavePlayEvent } from './applyCardsLeavePlayEvent';

/** The effect that opens Cleanup; it carries nothing. */
const event: CardsLeavePlayEvent = {
  effectType: 'cardsLeavePlay',
  eventType: 'gameEffect',
};

// The cards of this round, and one White played in an earlier round.
const blackCard = createTestCard();
const whiteCard = createTestCard();
const earlierWhiteCard = createTestCard();

/** Each side's card of the round in play, and White's played pile begun. */
function withCardsInPlay(): AuthoritativeGameState {
  const base = createEmptyGameState('standard');
  const withCards = updateCardState(base, {
    ...base.cardState,
    black: { ...base.cardState.black, inPlay: blackCard, played: [] },
    white: {
      ...base.cardState.white,
      inPlay: whiteCard,
      played: [earlierWhiteCard],
    },
  });
  return withCards;
}

/** Cleanup opening, each side's card still in play. */
function openingCleanup(): AuthoritativeGameState {
  // Cleanup, at the step where the cards leave play (§4.5.1).
  const opening = updatePhaseState(
    withCardsInPlay(),
    createCleanupPhaseState({ step: 'cardsLeavePlay' }),
  );
  return opening;
}

/**
 * Cleanup opens with this round's cards leaving play for the played pile,
 * where a rally will find them (§4.5.1, §10.3.3); then the first player
 * chooses whether to rally.
 */
describe('applyCardsLeavePlayEvent function', () => {
  it("puts each side's card in play on its played pile, after the cards played before it", () => {
    const next = applyCardsLeavePlayEvent(event, openingCleanup());

    // Nothing is in play any more.
    expect(next.cardState.white.inPlay).toBeNull();
    expect(next.cardState.black.inPlay).toBeNull();

    // Each card joins its owner's played pile, on top of earlier rounds'.
    expect(next.cardState.white.played).toStrictEqual([
      earlierWhiteCard,
      whiteCard,
    ]);
    expect(next.cardState.black.played).toStrictEqual([blackCard]);
  });

  it('turns to the first player to choose whether to rally', () => {
    const next = applyCardsLeavePlayEvent(event, openingCleanup());

    // The first player decides first, and finishes before the second
    // (§4.5.2, §10.3.6).
    expect(getCleanupPhaseState(next).step).toBe('firstPlayerChooseRally');
  });

  it("on White's seat, puts Black's card away too, since the played pile is face up", () => {
    // White's seat sees Black's card in play and its played pile, though not
    // Black's hand.
    const whiteSeen = projectGameStateForVisibility(
      openingCleanup(),
      'whiteSeen',
    );

    const next = applyCardsLeavePlayEvent(event, whiteSeen);

    // Black's card moves for White's seat as it does on the record.
    expect(next.cardState.black.inPlay).toBeNull();
    expect(next.cardState.black.played).toStrictEqual([blackCard]);
  });

  it('throws when the game is not in Cleanup', () => {
    // Still in Phase 4, no melee under way.
    const fighting = updatePhaseState(
      withCardsInPlay(),
      createResolveMeleePhaseState(withCardsInPlay(), {
        currentMeleeResolutionState: 'pending',
      }),
    );

    // The cards leave play only as Cleanup opens.
    expect(() => applyCardsLeavePlayEvent(event, fighting)).toThrow(
      'Expected cleanup phase, got resolveMelee',
    );
  });
});
