import type { Coordinate } from '@ruleValues';
import type { ResolveMeleePhaseState } from '@game';
import { RESOLVE_MELEE_PHASE } from '@game';

/**
 * Phase 4 as it opens: every engaged space fights this phase (§4.4.1), and
 * the first player chooses which is fought first (§4.4.2). No melee is under
 * way yet.
 *
 * @param remainingEngagements - Every space where two units stand engaged
 * @returns The Resolve Melee phase, with every engagement still to fight
 */
export function createOpenedResolveMeleePhaseState(
  remainingEngagements: Coordinate[],
): ResolveMeleePhaseState {
  // Each engagement is fought once, one at a time.
  const resolveMelee: ResolveMeleePhaseState = {
    currentMeleeResolutionState: 'pending',
    phase: RESOLVE_MELEE_PHASE,
    remainingEngagements,
    step: 'resolveMelee',
  };

  // The phase, open and no melee yet chosen.
  return resolveMelee;
}
