import type { StandardBoard, StandardBoardCoordinate } from '@entities';
import type { ChooseMeleeResolutionEventForBoard } from '@events';
import type { GameStateForBoard } from '@game';
import { RESOLVE_MELEE_PHASE } from '@game';

import { getResolveMeleePhaseState } from '@queries';
import { createEmptyGameState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyChooseMeleeEvent } from './applyChooseMeleeEvent';

/**
 * Resolve-melee phase: player picks which contested hex to resolve next. That coordinate is
 * removed from `remainingEngagements` and becomes `currentMeleeResolutionState.location`.
 */
describe(applyChooseMeleeEvent, () => {
  /** ResolveMelee step with the given engagement queue and no current resolution yet. */
  function createStateInResolveMeleeStep(
    remainingSpaces: StandardBoardCoordinate[],
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState();
    return updatePhaseState(state, {
      boardType: 'standard' as const,
      currentMeleeResolutionState: undefined,
      phase: RESOLVE_MELEE_PHASE,
      remainingEngagements: new Set(remainingSpaces),
      step: 'resolveMelee',
    });
  }

  it('given E-5 and E-6 pending and black chooses E-5, set shrinks to E-6 and current location E-5', () => {
    const state = createStateInResolveMeleeStep(['E-5', 'E-6']);
    const event: ChooseMeleeResolutionEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'chooseMeleeResolution',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'black',
      space: 'E-5',
    };

    const newState = applyChooseMeleeEvent(event, state);
    const phaseState = getResolveMeleePhaseState(newState);

    expect(phaseState.remainingEngagements).toStrictEqual(new Set(['E-6']));
    expect(phaseState.currentMeleeResolutionState?.location).toBe('E-5');
  });

  it('given white chooses E-6, input phase state remainingEngagements reference is untouched', () => {
    const state = createStateInResolveMeleeStep(['E-5', 'E-6']);
    const originalPhaseState = getResolveMeleePhaseState(state);
    const originalRemaining = originalPhaseState.remainingEngagements;

    const event: ChooseMeleeResolutionEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'chooseMeleeResolution',
      eventNumber: 0,
      eventType: 'playerChoice',
      player: 'white',
      space: 'E-6',
    };
    applyChooseMeleeEvent(event, state);

    expect(getResolveMeleePhaseState(state).remainingEngagements).toBe(
      originalRemaining,
    );
  });
});
