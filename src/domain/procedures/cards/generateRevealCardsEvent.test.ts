import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';
import { updatePhaseState } from '@transforms';

import { generateRevealCardsEvent } from './generateRevealCardsEvent';

/**
 * Reveal cards step: both players’ awaitingPlay cards become public knowledge.
 * The procedure bakes both card identities into the event payload.
 */
describe(generateRevealCardsEvent, () => {
  function createStateWithAwaitingPlay() {
    const state = createEmptyGameState();
    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        awaitingPlay: tempCommandCards[0],
      },
      white: {
        ...state.cardState.white,
        awaitingPlay: tempCommandCards[1],
      },
    });
    return updatePhaseState(stateWithCards, {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
  }

  it('emits gameEffect with effectType revealCards and both card payloads', () => {
    const state = createStateWithAwaitingPlay();
    const event = generateRevealCardsEvent(state, 0);

    expect(event.eventType).toBe('gameEffect');
    expect(event.effectType).toBe('revealCards');
    expect(event.black).toBe(tempCommandCards[0]);
    expect(event.white).toBe(tempCommandCards[1]);
  });

  it('given black awaitingPlay missing, throws', () => {
    const state = createStateWithAwaitingPlay();
    const stateMissingBlack = updateCardState(state, {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        awaitingPlay: null,
      },
    });

    expect(() => generateRevealCardsEvent(stateMissingBlack, 0)).toThrow(
      'Black player has no card awaiting play',
    );
  });

  it('given white awaitingPlay missing, throws', () => {
    const state = createStateWithAwaitingPlay();
    const stateMissingWhite = updateCardState(state, {
      ...state.cardState,
      white: {
        ...state.cardState.white,
        awaitingPlay: null,
      },
    });

    expect(() => generateRevealCardsEvent(stateMissingWhite, 0)).toThrow(
      'White player has no card awaiting play',
    );
  });
});
