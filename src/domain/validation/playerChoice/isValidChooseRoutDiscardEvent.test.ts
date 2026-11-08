import { tempCommandCards } from '@sampleValues';
import { PLAY_CARDS_PHASE } from '@game';
import {
  createCleanupPhaseState,
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
  updateCardState,
} from '@testing';

import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { isValidChooseRoutDiscardEvent } from './isValidChooseRoutDiscardEvent';

import { createChooseRoutDiscardEvent, createEmptyGameState } from '@factories';
/**
 * IsValidChooseRoutDiscardEvent: atom membership + integrity over getLegalRoutDiscardCards.
 */
describe('isValidChooseRoutDiscardEvent function', () => {
  function stateAwaitingWhiteDiscard(numberToDiscard: number) {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[2], tempCommandCards[3], tempCommandCards[4]],
        inPlay: null,
      },
    });
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState('white', createTestUnit('white'), {
        numberToDiscard,
      }),
    });
    return updatePhaseState(
      withCards,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rallyState,
        step: 'firstPlayerResolveRally',
      }),
    );
  }

  it('accepts a legal selection regardless of cardId order', () => {
    const state = stateAwaitingWhiteDiscard(2);
    const event = createChooseRoutDiscardEvent({
      cardIds: [tempCommandCards[4].id, tempCommandCards[2].id],
      eventNumber: 0,
      player: 'white',
    });

    expect(isValidChooseRoutDiscardEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts an empty selection when numberToDiscard is 0', () => {
    const state = stateAwaitingWhiteDiscard(0);
    const event = createChooseRoutDiscardEvent({
      cardIds: [],
      eventNumber: 0,
      player: 'white',
    });

    expect(isValidChooseRoutDiscardEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a selection with the wrong count', () => {
    const state = stateAwaitingWhiteDiscard(2);
    const event = createChooseRoutDiscardEvent({
      cardIds: [tempCommandCards[2].id],
      eventNumber: 0,
      player: 'white',
    });

    const validation = isValidChooseRoutDiscardEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toMatch(/Expected 2 cards/u);
  });

  it('rejects duplicate card IDs', () => {
    const state = stateAwaitingWhiteDiscard(2);
    const event = createChooseRoutDiscardEvent({
      cardIds: [tempCommandCards[2].id, tempCommandCards[2].id],
      eventNumber: 0,
      player: 'white',
    });

    const validation = isValidChooseRoutDiscardEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toMatch(/Duplicate/u);
  });

  it('rejects a card not in the legal atom set', () => {
    const state = stateAwaitingWhiteDiscard(1);
    const event = createChooseRoutDiscardEvent({
      cardIds: [tempCommandCards[0].id],
      eventNumber: 0,
      player: 'white',
    });

    const validation = isValidChooseRoutDiscardEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain(tempCommandCards[0].id);
  });

  it('rejects when rout discard is not expected', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createChooseRoutDiscardEvent({
      cardIds: [tempCommandCards[2].id],
      eventNumber: 0,
      player: 'white',
    });

    const validation = isValidChooseRoutDiscardEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toMatch(/not expected/iu);
  });
});
