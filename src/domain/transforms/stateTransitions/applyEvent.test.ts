import type { Event, RevealCardsEvent } from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { createChooseCardEvent, createEmptyGameState } from '@factories';
import { tempCommandCards } from '@sampleValues';
import { updateCardState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { applyEvent } from './applyEvent';

/** Both players choosing their cards, each holding one. */
function choosingCards(): GameState {
  const base = createEmptyGameState('standard');

  // Nothing laid down yet.
  const withHands = updateCardState(base, {
    ...base.cardState,
    black: {
      ...base.cardState.black,
      awaitingPlay: null,
      inHand: [tempCommandCards[0]],
    },
    white: {
      ...base.cardState.white,
      awaitingPlay: null,
      inHand: [tempCommandCards[1]],
    },
  });

  // The play-cards phase, at the step where cards are chosen (§4.1.1).
  const choosing = updatePhaseState(withHands, {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
  });
  return choosing;
}

/** Both cards laid face down, waiting to be revealed. */
function revealingCards(): GameState {
  const base = createEmptyGameState('standard');

  // Each side's card waits to be turned over; nothing is in play yet.
  const withCards = updateCardState(base, {
    ...base.cardState,
    black: {
      ...base.cardState.black,
      awaitingPlay: tempCommandCards[0],
      inPlay: null,
    },
    white: {
      ...base.cardState.white,
      awaitingPlay: tempCommandCards[1],
      inPlay: null,
    },
  });

  // The play-cards phase, at the reveal (§4.1.2).
  const revealing = updatePhaseState(withCards, {
    phase: PLAY_CARDS_PHASE,
    step: 'revealCards',
  });
  return revealing;
}

/**
 * Every event, a player's choice or a game effect, is applied here: its rule
 * changes the state, and the event joins the round's log.
 */
describe('applyEvent function', () => {
  it("applies a player's choice and adds it to the round's log", () => {
    // Black lays down its card.
    const event = createChooseCardEvent({
      card: tempCommandCards[0],
      player: 'black',
    });

    const result = applyEvent(event, choosingCards());

    // The card waits face down, and the choice is on record.
    expect(result.cardState.black.awaitingPlay).toBe(tempCommandCards[0]);
    expect(result.currentRoundState.events).toStrictEqual([event]);
  });

  it("applies a game effect and adds it to the round's log", () => {
    // Both cards are turned over.
    const event: RevealCardsEvent = {
      black: tempCommandCards[0],
      effectType: 'revealCards',
      eventType: 'gameEffect',
      white: tempCommandCards[1],
    };

    const result = applyEvent(event, revealingCards());

    // Both cards are now in play, and the reveal is on record.
    expect(result.cardState.black.inPlay).toBe(tempCommandCards[0]);
    expect(result.cardState.white.inPlay).toBe(tempCommandCards[1]);
    expect(result.currentRoundState.events).toStrictEqual([event]);
  });

  it("keeps the round's log in the order events were applied", () => {
    // Black chooses, then White.
    const blackChooses = createChooseCardEvent({
      card: tempCommandCards[0],
      player: 'black',
    });
    const whiteChooses = createChooseCardEvent({
      card: tempCommandCards[1],
      player: 'white',
    });

    const afterBlack = applyEvent(blackChooses, choosingCards());
    const afterWhite = applyEvent(whiteChooses, afterBlack);

    // Both choices are on record, Black's first.
    expect(afterWhite.currentRoundState.events).toStrictEqual([
      blackChooses,
      whiteChooses,
    ]);
  });

  it('throws for an event that is neither a choice nor an effect', () => {
    // An event of no known kind; the union forbids it.
    const event = { eventType: 'unknown' } as unknown as Event;

    // No rule applies, so the event is refused before anything is logged.
    expect(() => applyEvent(event, choosingCards())).toThrow(
      'Unknown event type: unknown',
    );
  });
});
