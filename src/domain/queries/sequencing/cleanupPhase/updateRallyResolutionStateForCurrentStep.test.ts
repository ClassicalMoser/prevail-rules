import type { RallyResolutionState } from '@game';
import { CLEANUP_PHASE } from '@game';

import { updateRallyResolutionStateForCurrentStep } from './updateRallyResolutionStateForCurrentStep';

/**
 * Immutable cleanup phase update: writes the new rally slice for the active resolve-rally step
 * and advances `step` in the same object shape.
 */
describe(updateRallyResolutionStateForCurrentStep, () => {
  it('given firstPlayerResolveRally, replaces first bucket and sets next step secondPlayerChooseRally', () => {
    const phaseState = {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally' as const,
    };

    const updatedRallyState: RallyResolutionState = {
      completed: false,
      playerRallied: true,
      rallyResolved: true,
      routState: undefined,
      unitsLostSupport: new Set(),
    };

    const newPhaseState = updateRallyResolutionStateForCurrentStep(
      phaseState,
      updatedRallyState,
      'secondPlayerChooseRally',
    );

    expect(newPhaseState.firstPlayerRallyResolutionState).toStrictEqual(
      updatedRallyState,
    );
    expect(newPhaseState.step).toBe('secondPlayerChooseRally');
  });

  it('given secondPlayerResolveRally, replaces second bucket and step complete', () => {
    const phaseState = {
      firstPlayerRallyResolutionState: undefined,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      step: 'secondPlayerResolveRally' as const,
    };

    const updatedRallyState: RallyResolutionState = {
      completed: false,
      playerRallied: true,
      rallyResolved: true,
      routState: undefined,
      unitsLostSupport: new Set(),
    };

    const newPhaseState = updateRallyResolutionStateForCurrentStep(
      phaseState,
      updatedRallyState,
      'complete',
    );

    expect(newPhaseState.secondPlayerRallyResolutionState).toStrictEqual(
      updatedRallyState,
    );
    expect(newPhaseState.step).toBe('complete');
  });

  it('given discardPlayedCards step, throws not on resolveRally step', () => {
    const phaseState = {
      firstPlayerRallyResolutionState: undefined,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'discardPlayedCards' as const,
    };

    const updatedRallyState: RallyResolutionState = {
      completed: false,
      playerRallied: true,
      rallyResolved: true,
      routState: undefined,
      unitsLostSupport: new Set(),
    };

    expect(() =>
      updateRallyResolutionStateForCurrentStep(
        phaseState,
        updatedRallyState,
        'complete',
      ),
    ).toThrow('Cleanup phase is not on a resolveRally step');
  });
});
