import type { CommandCard } from '@entities';
import type { RevealCardsEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getPlayCardsPhaseState } from '@queries';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import {
  projectGameStateForVisibility,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyRevealCardsEvent } from './applyRevealCardsEvent';

// The card each side laid face down.
const blackCard = createTestCard();
const whiteCard = createTestCard();

/**
 * The reveal as a procedure writes it. The cards arrive over the wire, so each
 * is a copy of the card the state holds, not the same object.
 */
function revealOf(black: CommandCard, white: CommandCard): RevealCardsEvent {
  const reveal: RevealCardsEvent = {
    black: { ...black },
    effectType: 'revealCards',
    eventType: 'gameEffect',
    white: { ...white },
  };
  return reveal;
}

/** Each side's card laid down, and nothing in play yet. */
function withCardsLaidDown(
  black: CommandCard | null,
  white: CommandCard | null,
): AuthoritativeGameState {
  const base = createEmptyGameState('standard');
  const withCards = updateCardState(base, {
    ...base.cardState,
    black: { ...base.cardState.black, awaitingPlay: black, inPlay: null },
    white: { ...base.cardState.white, awaitingPlay: white, inPlay: null },
  });
  return withCards;
}

/** Phase 1, both cards laid face down and waiting to be turned over. */
function choosingCards(): AuthoritativeGameState {
  // Both players have chosen (§4.1.1).
  const choosing = updatePhaseState(
    withCardsLaidDown(blackCard, whiteCard),
    createPlayCardsPhaseState({ step: 'chooseCards' }),
  );
  return choosing;
}

/**
 * The two face-down cards are turned over together and are in play for the
 * round (§4.1.2); initiative is compared next. A view that saw only the back
 * of a card learns which card it is from the reveal.
 */
describe('applyRevealCardsEvent function', () => {
  it('turns both cards face up into play, and initiative is decided next', () => {
    const next = applyRevealCardsEvent(
      revealOf(blackCard, whiteCard),
      choosingCards(),
    );

    // Each card is in play, and nothing waits face down.
    expect(next.cardState.black.inPlay).toBe(blackCard);
    expect(next.cardState.white.inPlay).toBe(whiteCard);
    expect(next.cardState.black.awaitingPlay).toBeNull();
    expect(next.cardState.white.awaitingPlay).toBeNull();

    // The lower initiative is compared next (§4.1.3).
    expect(getPlayCardsPhaseState(next).step).toBe('assignInitiative');
  });

  it("on White's seat, turns over White's own copy and learns Black's card from the reveal", () => {
    // White's seat holds its own card, and only the back of Black's.
    const whiteSeen = projectGameStateForVisibility(
      choosingCards(),
      'whiteSeen',
    );
    const event = revealOf(blackCard, whiteCard);

    const next = applyRevealCardsEvent(event, whiteSeen);

    // White's card is the copy the seat already held, not the event's.
    expect(next.cardState.white.inPlay).toBe(whiteCard);
    // Black's is the event's, the only copy the seat has.
    expect(next.cardState.black.inPlay).toBe(event.black);
  });

  it("on Black's seat, turns over Black's own copy and learns White's card from the reveal", () => {
    // Black's seat holds its own card, and only the back of White's.
    const blackSeen = projectGameStateForVisibility(
      choosingCards(),
      'blackSeen',
    );
    const event = revealOf(blackCard, whiteCard);

    const next = applyRevealCardsEvent(event, blackSeen);

    // Black's card is the copy the seat already held, not the event's.
    expect(next.cardState.black.inPlay).toBe(blackCard);
    // White's is the event's, the only copy the seat has.
    expect(next.cardState.white.inPlay).toBe(event.white);
  });

  it('throws before the round has a phase', () => {
    // Round 0 is setup; no card is played in it.
    const setup = withCardsLaidDown(blackCard, whiteCard);

    expect(() =>
      applyRevealCardsEvent(revealOf(blackCard, whiteCard), setup),
    ).toThrow('No current phase state found');
  });

  it('throws when the game is not playing cards', () => {
    // The commanders are already moving.
    const moving = updatePhaseState(
      withCardsLaidDown(blackCard, whiteCard),
      createMoveCommandersPhaseState(),
    );

    // Cards are turned over only in Phase 1 (§4.1.2).
    expect(() =>
      applyRevealCardsEvent(revealOf(blackCard, whiteCard), moving),
    ).toThrow('Expected playCards phase, got moveCommanders');
  });

  it('throws when a side has laid no card down', () => {
    // White has chosen; Black has not.
    const halfChosen = updatePhaseState(
      withCardsLaidDown(null, whiteCard),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );

    // Both cards are turned over together, so both must be down (§4.1.2).
    expect(() =>
      applyRevealCardsEvent(revealOf(blackCard, whiteCard), halfChosen),
    ).toThrow('Player has no card awaiting play');
  });
});
