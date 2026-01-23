import type { Board, CleanupPhaseState, RallyResolutionState } from '@entities';

/**
 * Updates the rally resolution state for the current cleanup phase step.
 * Determines which player's rally state to update based on the current step.
 *
 * @param phaseState - The current cleanup phase state
 * @param rallyState - The updated rally resolution state
 * @param nextStep - The step to advance to after updating
 * @returns A new cleanup phase state with the updated rally resolution state
 * @throws Error if not in a resolveRally step
 */
export function updateRallyResolutionStateForCurrentStep<_TBoard extends Board>(
  phaseState: CleanupPhaseState,
  rallyState: RallyResolutionState,
  nextStep: CleanupPhaseState['step'],
): CleanupPhaseState {
  if (phaseState.step === 'firstPlayerResolveRally') {
    return {
      ...phaseState,
      firstPlayerRallyResolutionState: rallyState,
      step: nextStep,
    };
  }

  if (phaseState.step === 'secondPlayerResolveRally') {
    return {
      ...phaseState,
      secondPlayerRallyResolutionState: rallyState,
      step: nextStep,
    };
  }

  throw new Error(
    `Cleanup phase is not on a resolveRally step: ${phaseState.step}`,
  );
}
