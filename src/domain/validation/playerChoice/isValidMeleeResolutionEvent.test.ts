import type { Coordinate } from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { createEmptyGameState, createResolveMeleePhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseMeleeResolutionEvent } from './isValidMeleeResolutionEvent';

/**
 * IsValidChooseMeleeResolutionEvent: membership against getLegalChooseMeleeResolutionEvents.
 */
describe(isValidChooseMeleeResolutionEvent, () => {
  function stateWithRemaining(remaining: readonly Coordinate[]) {
    const base = createEmptyGameState({ currentInitiative: 'black' });
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: 'pending',
      remainingEngagements: [...remaining],
    });
    return updatePhaseState(base, phase);
  }

  it('accepts a remaining engagement for the initiative player', () => {
    const state = stateWithRemaining(['E-5', 'E-6']);
    const event: ChooseMeleeResolutionEvent = {
      choiceType: 'chooseMeleeResolution',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      player: 'black',
      space: 'E-5',
    };

    expect(isValidChooseMeleeResolutionEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a space that is not among remaining engagements', () => {
    const state = stateWithRemaining(['E-5']);
    const event: ChooseMeleeResolutionEvent = {
      choiceType: 'chooseMeleeResolution',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      player: 'black',
      space: 'E-6',
    };

    const validation = isValidChooseMeleeResolutionEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason).toContain('E-6');
  });

  it('rejects when not in resolveMelee', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: ChooseMeleeResolutionEvent = {
      choiceType: 'chooseMeleeResolution',
      eventNumber: 0,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      player: 'black',
      space: 'E-5',
    };

    const validation = isValidChooseMeleeResolutionEvent(event, state);
    expect(validation.result).toBe(false);
    if (validation.result !== false) {
      throw new Error('expected fail');
    }
    expect(validation.errorReason.length).toBeGreaterThan(0);
  });
});
