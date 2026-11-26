import { createOpenedCleanupPhaseState } from '@factories';
import type { CleanupPhaseState } from '@game';

/**
 * Phase 5 as it opens, with what a spec sets beyond that.
 *
 * @param overrides - A later step, or a rally under way
 * @returns The Cleanup phase, to put in a game with `updatePhaseState`
 */
export function createCleanupPhaseState(
  overrides?: Partial<CleanupPhaseState>,
): CleanupPhaseState {
  const cleanup: CleanupPhaseState = {
    // Both cards in play go to their played piles first (§4.5.1), and
    // neither player has yet decided whether to rally (§4.5.2).
    ...createOpenedCleanupPhaseState(),
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return cleanup;
}
