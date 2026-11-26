import type { CleanupPhaseState } from '@game';

/**
 * Creates a CleanupPhaseState with sensible defaults.
 */
export function createCleanupPhaseState(
  overrides?: Partial<CleanupPhaseState>,
): CleanupPhaseState {
  const cleanup: CleanupPhaseState = {
    // Neither player has yet decided whether to rally; the first decides
    // first (§4.5.2).
    firstPlayerRallyResolutionState: 'pending',
    phase: 'cleanup' as const,
    secondPlayerRallyResolutionState: 'pending',
    // Phase 5 opens with both cards in play going to their played piles
    // (§4.5.1).
    step: 'cardsLeavePlay',
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return cleanup;
}
