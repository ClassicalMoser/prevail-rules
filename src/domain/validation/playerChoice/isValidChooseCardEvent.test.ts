import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState, updateCardState } from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseCardEvent } from './isValidChooseCardEvent';

/**
 * IsValidChooseCardEvent: membership against getLegalChooseCardOptions.
 */
describe(isValidChooseCardEvent, () => {
  function stateChooseCardsBothPending(): GameState {
    const base = createEmptyGameState();
    const withPhase = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    return updateCardState(withPhase, {
      ...withPhase.cardState,
      black: {
        ...withPhase.cardState.black,
        awaitingPlay: null,
        inHand: [tempCommandCards[2]],
      },
      white: {
        ...withPhase.cardState.white,
        awaitingPlay: null,
        inHand: [tempCommandCards[3]],
      },
    });
  }

  it('accepts a card that is in the pending player hand', () => {
    const state = stateChooseCardsBothPending();
    const event: ChooseCardEvent = {
      card: tempCommandCards[2],
      choiceType: 'chooseCard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    expect(isValidChooseCardEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a card that is not in the player hand', () => {
    const state = stateChooseCardsBothPending();
    const event: ChooseCardEvent = {
      card: tempCommandCards[0],
      choiceType: 'chooseCard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    const validation = isValidChooseCardEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain(tempCommandCards[0].id);
  });

  it('rejects when not in the chooseCards step', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'revealCards',
    });
    const event: ChooseCardEvent = {
      card: tempCommandCards[2],
      choiceType: 'chooseCard',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
    };

    const validation = isValidChooseCardEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain(tempCommandCards[2].id);
    expect(validation.errorReason).toMatch(/not a legal choice/i);
  });
});
