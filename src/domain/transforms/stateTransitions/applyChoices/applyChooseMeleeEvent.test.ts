import type { StandardBoard, StandardBoardCoordinate } from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import type { StandardGameState } from '@game';
import { RESOLVE_MELEE_PHASE } from '@game';

import { getResolveMeleePhaseState } from '@queries';
import { createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyChooseMeleeEvent } from './applyChooseMeleeEvent';

/**
 * Resolve-melee phase: player picks which contested hex to resolve next. That coordinate is
 * removed from `remainingEngagements` and becomes `currentMeleeResolutionState.location`.
 */
describe('applyChooseMeleeEvent', () => {
  /** resolveMelee step with the given engagement queue and no current resolution yet. */
  function createStateInResolveMeleeStep(
    remainingSpaces: StandardBoardCoordinate[],
  ): StandardGameState {
    const state = createEmptyGameState();
    return updatePhaseState(state, {
      phase: RESOLVE_MELEE_PHASE,
      boardType: 'standard' as const,
      step: 'resolveMelee',
      remainingEngagements: new Set(remainingSpaces),
      currentMeleeResolutionState: undefined,
    });
  }

  it('given E-5 and E-6 pending and black chooses E-5, set shrinks to E-6 and current location E-5', () => {
    const state = createStateInResolveMeleeStep(['E-5', 'E-6']);
    const event: ChooseMeleeResolutionEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'chooseMeleeResolution',
      boardType: 'standard',
      player: 'black',
      space: 'E-5',
    };

    const newState = applyChooseMeleeEvent(event, state);
    const phaseState = getResolveMeleePhaseState(newState);

    expect(phaseState.remainingEngagements).toEqual(new Set(['E-6']));
    expect(phaseState.currentMeleeResolutionState?.location).toBe('E-5');
  });

  it('given white chooses E-6, input phase state remainingEngagements reference is untouched', () => {
    const state = createStateInResolveMeleeStep(['E-5', 'E-6']);
    const originalPhaseState = getResolveMeleePhaseState(state);
    const originalRemaining = originalPhaseState.remainingEngagements;

    const event: ChooseMeleeResolutionEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'chooseMeleeResolution',
      boardType: 'standard',
      player: 'white',
      space: 'E-6',
    };
    applyChooseMeleeEvent(event, state);

    expect(getResolveMeleePhaseState(state).remainingEngagements).toBe(
      originalRemaining,
    );
  });
});
