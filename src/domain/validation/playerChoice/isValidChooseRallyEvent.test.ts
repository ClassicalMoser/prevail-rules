import type { ChooseRallyEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { isValidChooseRallyEvent } from './isValidChooseRallyEvent';

import { createEmptyGameState } from '@factories';
/**
 * IsValidChooseRallyEvent: membership against getLegalChooseRallyEvent.
 */
describe(isValidChooseRallyEvent, () => {
  it('accepts either performRally option for the active player', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const state = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    const event: ChooseRallyEvent = {
      choiceType: 'chooseRally',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      performRally: false,
      player: 'white',
    };

    expect(isValidChooseRallyEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects when the wrong player tries to choose rally', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const state = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    const event: ChooseRallyEvent = {
      choiceType: 'chooseRally',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      performRally: true,
      player: 'black',
    };

    const validation = isValidChooseRallyEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('black');
  });

  it('rejects when not in a chooseRally step', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: ChooseRallyEvent = {
      choiceType: 'chooseRally',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      performRally: true,
      player: 'black',
    };

    const validation = isValidChooseRallyEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toMatch(
      /Expected cleanup phase|Not in choose rally step/iu,
    );
  });
});
