import type { CleanupPhaseState } from '@game';
import { CLEANUP_PHASE } from '@game';

/**
 * Phase 5 as it opens: both cards in play go to their played piles
 * (§4.5.1). Neither player has yet decided whether to rally; the first
 * decides first (§4.5.2).
 *
 * @returns The Cleanup phase, on its first step
 */
export function createOpenedCleanupPhaseState(): CleanupPhaseState {
  // The cards leave play before anyone rallies.
  const cleanup: CleanupPhaseState = {
    firstPlayerRallyResolutionState: 'pending',
    phase: CLEANUP_PHASE,
    secondPlayerRallyResolutionState: 'pending',
    step: 'cardsLeavePlay',
  };

  // The phase, open and no rally yet decided.
  return cleanup;
}
