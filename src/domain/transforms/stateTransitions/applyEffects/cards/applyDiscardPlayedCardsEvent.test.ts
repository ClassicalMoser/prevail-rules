import type { GameState, StandardBoard } from '@entities';
import type { DiscardPlayedCardsEvent } from '@events';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createTestCard,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyDiscardPlayedCardsEvent } from './applyDiscardPlayedCardsEvent';

/**
 * Cleanup opener: both `inPlay` command cards append to `played` piles, slots clear, and the
 * cleanup step advances to the first rally choice.
 */
describe('applyDiscardPlayedCardsEvent', () => {
  it('given discardPlayedCards with both inPlay set, played lengths grow and step firstPlayerChooseRally', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const full: GameState<StandardBoard> = updatePhaseState(
      withCards,
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );

    const whitePlayedBefore = full.cardState.white.played.length;
    const blackPlayedBefore = full.cardState.black.played.length;

    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'discardPlayedCards' as const,
    } satisfies DiscardPlayedCardsEvent<StandardBoard>;

    const next = applyDiscardPlayedCardsEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('cleanup');
    if (phase?.phase !== 'cleanup') throw new Error('cleanup');
    expect(phase.step).toBe('firstPlayerChooseRally');
    expect(next.cardState.white.inPlay).toBeNull();
    expect(next.cardState.black.inPlay).toBeNull();
    expect(next.cardState.white.played.length).toBe(whitePlayedBefore + 1);
    expect(next.cardState.black.played.length).toBe(blackPlayedBefore + 1);
  });
});
