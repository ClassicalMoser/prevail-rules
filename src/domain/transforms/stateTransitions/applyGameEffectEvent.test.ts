import type { DiscardPlayedCardsEvent, GameEffectEvent } from '@events';
import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { tempCommandCards } from '@sampleValues';
import { createCleanupPhaseState, updateCardState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { applyGameEffectEvent } from './applyGameEffectEvent';

/** Cleanup is opening, with each side's card of the round still in play. */
function cleanupWithCardsInPlay(): GameState {
  const base = createEmptyGameState('standard');

  // The cards played this round are still in play.
  const withCards = updateCardState(base, {
    ...base.cardState,
    black: { ...base.cardState.black, inPlay: tempCommandCards[0], played: [] },
    white: { ...base.cardState.white, inPlay: tempCommandCards[1], played: [] },
  });

  // Cleanup, at the step that puts them aside.
  const cleanup = updatePhaseState(
    withCards,
    createCleanupPhaseState({ step: 'discardPlayedCards' }),
  );
  return cleanup;
}

/**
 * A game effect is applied by the rule for that kind of effect. Each rule has
 * its own spec; this one checks that an effect reaches its rule.
 */
describe('applyGameEffectEvent function', () => {
  it('applies the end of a round: each card in play goes to its played pile', () => {
    const event: DiscardPlayedCardsEvent = {
      effectType: 'discardPlayedCards',
      eventType: 'gameEffect',
    };

    const result = applyGameEffectEvent(event, cleanupWithCardsInPlay());

    // Nothing is left in play; each card waits on its played pile for a rally.
    expect(result.cardState.black.inPlay).toBeNull();
    expect(result.cardState.white.inPlay).toBeNull();
    expect(result.cardState.black.played).toStrictEqual([tempCommandCards[0]]);
    expect(result.cardState.white.played).toStrictEqual([tempCommandCards[1]]);
  });

  it('throws for a kind of effect it has no rule for', () => {
    const event = {
      effectType: 'unknown',
      eventType: 'gameEffect',
      // The default branch needs an effectType the union forbids.
    } as unknown as GameEffectEvent;

    // No rule applies, so the effect is refused outright.
    expect(() => applyGameEffectEvent(event, cleanupWithCardsInPlay())).toThrow(
      'Unreachable: unhandled game effect event (effectType not in switch)',
    );
  });
});
