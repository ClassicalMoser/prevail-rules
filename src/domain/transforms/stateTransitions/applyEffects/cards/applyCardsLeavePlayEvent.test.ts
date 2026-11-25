import { throwIfNone } from '@utils';
import type { CardsLeavePlayEvent } from '@events';
import type { GameState, WhiteSeenGameState } from '@game';
import {
  createCleanupPhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCardsLeavePlayEvent } from './applyCardsLeavePlayEvent';

import { createEmptyGameState } from '@factories';
/**
 * Cleanup opener: both `inPlay` command cards append to `played` piles, slots clear, and the
 * cleanup step advances to the first rally choice.
 */
describe('applyCardsLeavePlayEvent function', () => {
  const event = {
    effectType: 'cardsLeavePlay' as const,
    eventType: 'gameEffect' as const,
  } satisfies CardsLeavePlayEvent;

  it('given cardsLeavePlay with both inPlay set, played lengths grow and step firstPlayerChooseRally', () => {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const full: GameState = updatePhaseState(
      withCards,
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    const whitePlayedBefore = full.cardState.white.played.length;
    const blackPlayedBefore = full.cardState.black.played.length;

    const next = applyCardsLeavePlayEvent(event, full);
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
    const base = createEmptyGameState('standard');
    const blackCard = createTestCard();
    const whiteCard = createTestCard();
    const whiteSeen: WhiteSeenGameState = updatePhaseState(
      {
        ...base,
        visibility: 'whiteSeen',
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
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    const next = applyCardsLeavePlayEvent(event, whiteSeen);

    expect(next.cardState.visibility).toBe('whiteSeen');
    expect(next.cardState.white.inPlay).toBeNull();
    expect(next.cardState.white.played).toStrictEqual([whiteCard]);
    expect(next.cardState.black.inPlay).toBeNull();
    expect(next.cardState.black.played).toStrictEqual([blackCard]);
  });
});
