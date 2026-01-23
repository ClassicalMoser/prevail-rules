import type { RallyResolutionState } from '@entities';
import { CLEANUP_PHASE } from '@entities';
import { describe, expect, it } from 'vitest';
import { updateRallyResolutionStateForCurrentStep } from './updateRallyResolutionStateForCurrentStep';

describe('updateRallyResolutionStateForCurrentStep', () => {
  it('should update first player rally state when step is firstPlayerResolveRally', () => {
    const phaseState = {
      phase: CLEANUP_PHASE,
      step: 'firstPlayerResolveRally' as const,
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    };

    const updatedRallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
      completed: false,
    };

    const newPhaseState = updateRallyResolutionStateForCurrentStep(
      phaseState,
      updatedRallyState,
      'secondPlayerChooseRally',
    );

    expect(newPhaseState.firstPlayerRallyResolutionState).toEqual(
      updatedRallyState,
    );
    expect(newPhaseState.step).toBe('secondPlayerChooseRally');
  });

  it('should update second player rally state when step is secondPlayerResolveRally', () => {
    const phaseState = {
      phase: CLEANUP_PHASE,
      step: 'secondPlayerResolveRally' as const,
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
    };

    const updatedRallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
      completed: false,
    };

    const newPhaseState = updateRallyResolutionStateForCurrentStep(
      phaseState,
      updatedRallyState,
      'complete',
    );

    expect(newPhaseState.secondPlayerRallyResolutionState).toEqual(
      updatedRallyState,
    );
    expect(newPhaseState.step).toBe('complete');
  });

  it('should throw error when not in resolveRally step', () => {
    const phaseState = {
      phase: CLEANUP_PHASE,
      step: 'discardPlayedCards' as const,
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    const updatedRallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
      completed: false,
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
