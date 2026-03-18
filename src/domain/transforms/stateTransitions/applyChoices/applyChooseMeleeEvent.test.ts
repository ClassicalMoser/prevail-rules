import type {
  GameState,
  StandardBoard,
  StandardBoardCoordinate,
} from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import { RESOLVE_MELEE_PHASE } from '@entities';
import { getResolveMeleePhaseState } from '@queries';
import { createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyChooseMeleeEvent } from './applyChooseMeleeEvent';

describe('applyChooseMeleeEvent', () => {
  function createStateInResolveMeleeStep(
    remainingSpaces: StandardBoardCoordinate[],
  ): GameState<StandardBoard> {
    const state = createEmptyGameState();
    return updatePhaseState(state, {
      phase: RESOLVE_MELEE_PHASE,
      step: 'resolveMelee',
      remainingEngagements: new Set(remainingSpaces),
      currentMeleeResolutionState: undefined,
    });
  }

  it('should remove chosen space from remainingEngagements and set currentMeleeResolutionState to chosen location', () => {
    const state = createStateInResolveMeleeStep(['E-5', 'E-6']);
    const event: ChooseMeleeResolutionEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseMeleeResolution',
      player: 'black',
      space: 'E-5',
    };

    const newState = applyChooseMeleeEvent(event, state);
    const phaseState = getResolveMeleePhaseState(newState);

    expect(phaseState.remainingEngagements).toEqual(new Set(['E-6']));
    expect(phaseState.currentMeleeResolutionState?.location).toBe('E-5');
  });

  it('should not mutate the original state', () => {
    const state = createStateInResolveMeleeStep(['E-5', 'E-6']);
    const originalPhaseState = getResolveMeleePhaseState(state);
    const originalRemaining = originalPhaseState.remainingEngagements;

    const event: ChooseMeleeResolutionEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseMeleeResolution',
      player: 'white',
      space: 'E-6',
    };
    applyChooseMeleeEvent(event, state);

    expect(getResolveMeleePhaseState(state).remainingEngagements).toBe(
      originalRemaining,
    );
  });
});
