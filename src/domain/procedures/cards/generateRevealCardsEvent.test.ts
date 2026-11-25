import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { createPlayCardsPhaseState, createTestCard } from '@testing';
import { replaceCardState, updatePhaseState } from '@transforms';

import { generateRevealCardsEvent } from './generateRevealCardsEvent';

/**
 * Reveal cards step: both players’ awaitingPlay cards become public knowledge.
 * The procedure bakes both card identities into the event payload.
 */
describe('generateRevealCardsEvent function', () => {
  it('puts both face-down cards on the event once both players have chosen', () => {
    // Each player has chosen a card, still face down, in Phase 1.
    const blackCard = createTestCard();
    const whiteCard = createTestCard();
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );
    const state = replaceCardState(
      choosing,
      createCardState({
        black: createOwnedCardState({ awaitingPlay: blackCard }),
        white: createOwnedCardState({ awaitingPlay: whiteCard }),
      }),
    );

    // Both are revealed together (§4.1.2), each side's own card.
    expect(generateRevealCardsEvent(state)).toStrictEqual({
      black: blackCard,
      effectType: 'revealCards',
      eventType: 'gameEffect',
      white: whiteCard,
    });
  });

  it('throws when Black has not chosen a card', () => {
    // Only White's card waits face down.
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );
    const state = replaceCardState(
      choosing,
      createCardState({
        black: createOwnedCardState({}),
        white: createOwnedCardState({ awaitingPlay: createTestCard() }),
      }),
    );

    // The reveal waits for both (§4.1.2); the missing side is named.
    expect(() => generateRevealCardsEvent(state)).toThrow(
      'Black player has no card awaiting play',
    );
  });

  it('throws when White has not chosen a card', () => {
    // Only Black's card waits face down.
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );
    const state = replaceCardState(
      choosing,
      createCardState({
        black: createOwnedCardState({ awaitingPlay: createTestCard() }),
        white: createOwnedCardState({}),
      }),
    );

    // The reveal waits for both (§4.1.2); the missing side is named.
    expect(() => generateRevealCardsEvent(state)).toThrow(
      'White player has no card awaiting play',
    );
  });
});
