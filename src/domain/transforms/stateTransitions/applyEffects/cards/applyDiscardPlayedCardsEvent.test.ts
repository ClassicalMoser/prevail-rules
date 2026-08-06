import { throwIfNone } from '@utils';
import type { DiscardPlayedCardsEvent } from '@events';
import type { GameState, GameStateForVisibility } from '@game';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyDiscardPlayedCardsEvent } from './applyDiscardPlayedCardsEvent';

/**
 * Cleanup opener: both `inPlay` command cards append to `played` piles, slots clear, and the
 * cleanup step advances to the first rally choice.
 */
describe(applyDiscardPlayedCardsEvent, () => {
  const event = {
    effectType: 'discardPlayedCards' as const,
    eventNumber: 0,
    eventType: 'gameEffect' as const,
  } satisfies DiscardPlayedCardsEvent;

  it('given discardPlayedCards with both inPlay set, played lengths grow and step firstPlayerChooseRally', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const full: GameState = updatePhaseState(
      withCards,
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );

    const whitePlayedBefore = full.cardState.white.played.length;
    const blackPlayedBefore = full.cardState.black.played.length;

    const next = applyDiscardPlayedCardsEvent(event, full);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('cleanup');
    if (phase.phase !== 'cleanup') {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('firstPlayerChooseRally');
    expect(next.cardState.white.inPlay).toBeNull();
    expect(next.cardState.black.inPlay).toBeNull();
    expect(next.cardState.white.played).toHaveLength(whitePlayedBefore + 1);
    expect(next.cardState.black.played).toHaveLength(blackPlayedBefore + 1);
  });

  it('given whiteSeen, moves owned and hidden inPlay to played', () => {
    const base = createEmptyGameState();
    const blackCard = createTestCard();
    const whiteCard = createTestCard();
    const whiteSeen: GameStateForVisibility<'whiteSeen'> = updatePhaseState(
      {
        ...base,
        cardState: {
          visibility: 'whiteSeen',
          white: { ...base.cardState.white, inPlay: whiteCard, played: [] },
          black: {
            awaitingPlay: 'hidden',
            burnt: [],
            discarded: [],
            inHand: ['hidden'],
            inPlay: blackCard,
            played: [],
          },
        },
      },
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );

    const next = applyDiscardPlayedCardsEvent(event, whiteSeen);

    expect(next.cardState.visibility).toBe('whiteSeen');
    expect(next.cardState.white.inPlay).toBeNull();
    expect(next.cardState.white.played).toStrictEqual([whiteCard]);
    expect(next.cardState.black.inPlay).toBeNull();
    expect(next.cardState.black.played).toStrictEqual([blackCard]);
  });
});
