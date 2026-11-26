import type { CleanupPhaseState } from '@game';

/**
 * Creates a CleanupPhaseState with sensible defaults.
 */
export function createCleanupPhaseState(
  overrides?: Partial<CleanupPhaseState>,
): CleanupPhaseState {
  const cleanup: CleanupPhaseState = {
    firstPlayerRallyResolutionState: 'pending',
    phase: 'cleanup' as const,
    secondPlayerRallyResolutionState: 'pending',
    step: 'cardsLeavePlay',
    ...overrides,
  };
  return cleanup;
}
