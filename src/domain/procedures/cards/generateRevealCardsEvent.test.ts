import { tempCommandCards } from '@sampleValues';
import { PLAY_CARDS_PHASE } from '@game';
import { updateCardState } from '@testing';

import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { generateRevealCardsEvent } from './generateRevealCardsEvent';

import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
/**
 * Reveal cards step: both players’ awaitingPlay cards become public knowledge.
 * The procedure bakes both card identities into the event payload.
 */
describe('generateRevealCardsEvent function', () => {
  function createStateWithAwaitingPlay() {
    const state = createEmptyGameState('standard');
    const stateWithCards = updateCardState(
      state,
      createCardState({
        black: createOwnedCardState({ awaitingPlay: tempCommandCards[0] }),
        white: createOwnedCardState({ awaitingPlay: tempCommandCards[1] }),
      }),
    );
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
    const stateMissingBlack = updatePlayerCardState(
      state,
      'black',
      createOwnedCardState({ awaitingPlay: null }),
    );

    expect(() => generateRevealCardsEvent(stateMissingBlack, 0)).toThrow(
      'Black player has no card awaiting play',
    );
  });

  it('given white awaitingPlay missing, throws', () => {
    const state = createStateWithAwaitingPlay();
    const stateMissingWhite = updatePlayerCardState(
      state,
      'white',
      createOwnedCardState({ awaitingPlay: null }),
    );

    expect(() => generateRevealCardsEvent(stateMissingWhite, 0)).toThrow(
      'White player has no card awaiting play',
    );
  });
});
