import type { StandardBoard } from '@entities';
import type { DiscardPlayedCardsEvent } from '@events';
import type { GameStateForBoard } from '@game';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createTestCard,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';

import { applyDiscardPlayedCardsEvent } from './applyDiscardPlayedCardsEvent';

/**
 * Cleanup opener: both `inPlay` command cards append to `played` piles, slots clear, and the
 * cleanup step advances to the first rally choice.
 */
describe(applyDiscardPlayedCardsEvent, () => {
  it('given discardPlayedCards with both inPlay set, played lengths grow and step firstPlayerChooseRally', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      black: { ...c.black, inPlay: createTestCard() },
      white: { ...c.white, inPlay: createTestCard() },
    }));
    const full: GameStateForBoard<StandardBoard> = updatePhaseState(
      withCards,
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );

    const whitePlayedBefore = full.cardState.white.played.length;
    const blackPlayedBefore = full.cardState.black.played.length;

    const event = {
      effectType: 'discardPlayedCards' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
    } satisfies DiscardPlayedCardsEvent;

    const next = applyDiscardPlayedCardsEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('cleanup');
    if (phase?.phase !== 'cleanup') {
      throw new Error('cleanup');
    }
    expect(phase.step).toBe('firstPlayerChooseRally');
    expect(next.cardState.white.inPlay).toBeNull();
    expect(next.cardState.black.inPlay).toBeNull();
    expect(next.cardState.white.played).toHaveLength(whitePlayedBefore + 1);
    expect(next.cardState.black.played).toHaveLength(blackPlayedBefore + 1);
  });
});
