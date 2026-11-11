import { PLAY_CARDS_PHASE } from '@game';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { isValidChooseRallyEvent } from './isValidChooseRallyEvent';

import { createChooseRallyEvent, createEmptyGameState } from '@factories';
/**
 * IsValidChooseRallyEvent: membership against getLegalChooseRallyEvent.
 */
describe('isValidChooseRallyEvent function', () => {
  it('accepts either performRally option for the active player', () => {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const state = updatePhaseState(
      base,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );
    const event = createChooseRallyEvent({
      performRally: false,
      player: 'white',
    });

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
    const event = createChooseRallyEvent({
      performRally: true,
      player: 'black',
    });

    const validation = isValidChooseRallyEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('black');
  });

  it('throws, naming the phase, when the game is not in cleanup', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createChooseRallyEvent({
      performRally: true,
      player: 'black',
    });

    // Choosing to rally belongs to cleanup, so the enumerator refuses to list
    // options anywhere else; the boundary turns that into a refusal.
    expect(() => isValidChooseRallyEvent(event, state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});
