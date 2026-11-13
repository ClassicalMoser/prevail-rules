import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { createChooseCardEvent, createEmptyGameState } from '@factories';
import { tempCommandCards } from '@sampleValues';
import { updateCardState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { applyPlayerChoiceEvent } from './applyPlayerChoiceEvent';

/** Both players choosing their cards, Black holding two and White one. */
function choosingCards(): GameState {
  const base = createEmptyGameState('standard');

  // Nothing laid down yet; each hand holds the cards it may choose from.
  const withHands = updateCardState(base, {
    ...base.cardState,
    black: {
      ...base.cardState.black,
      awaitingPlay: null,
      inHand: [tempCommandCards[0], tempCommandCards[1]],
    },
    white: {
      ...base.cardState.white,
      awaitingPlay: null,
      inHand: [tempCommandCards[2]],
    },
  });

  // The play-cards phase, at the step where cards are chosen (§4.1.1).
  const choosing = updatePhaseState(withHands, {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
  });
  return choosing;
}

/**
 * A player's choice is applied by the rule for that kind of choice. Each
 * rule has its own spec; this one checks that a choice reaches its rule.
 */
describe('applyPlayerChoiceEvent function', () => {
  it('applies a card choice: the card leaves the hand and waits to be revealed', () => {
    // Black lays down the first of its two cards.
    const event = createChooseCardEvent({
      card: tempCommandCards[0],
      player: 'black',
    });

    const result = applyPlayerChoiceEvent(event, choosingCards());

    // The card is face down, waiting for the reveal; the other stays in hand.
    expect(result.cardState.black.awaitingPlay).toBe(tempCommandCards[0]);
    expect(result.cardState.black.inHand).toStrictEqual([tempCommandCards[1]]);
  });

  it('throws for a kind of choice it has no rule for', () => {
    const event = {
      choiceType: 'unknown',
      eventType: 'playerChoice',
      player: 'black',
      // The default branch needs a choiceType the union forbids.
    } as unknown as PlayerChoiceEvent;

    // No rule applies, so the choice is refused outright.
    expect(() => applyPlayerChoiceEvent(event, choosingCards())).toThrow(
      'Unknown player choice event type: unknown',
    );
  });
});
