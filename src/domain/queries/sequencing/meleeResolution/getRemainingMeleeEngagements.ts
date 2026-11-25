import type { Coordinate } from '@entities';
import type { ResolveMeleePhaseState } from '@game';

/**
 * Gets the set of board spaces still awaiting melee resolution for this phase.
 *
 * @param phaseState - Narrowed resolve-melee phase state
 * @returns The remaining engagements set (same reference as on the phase state)
 */
export function getRemainingMeleeEngagements(
  phaseState: ResolveMeleePhaseState,
): Coordinate[] {
  // TODO(composition): a module whose reason is one field of a phase the caller
  // already holds. Its only caller, `getLegalChooseMeleeResolutionEvents`,
  // reads the same phase's `step` and `currentMeleeResolutionState` directly.
  // Settle whether a narrowed phase's own fields need a reader at all.
  // Every engaged space fights this phase (§4.4.1); these are the ones the
  // first player has still to choose among (§4.4.2).
  const remainingEngagements = phaseState.remainingEngagements;

  // The spaces still to fight, as the phase holds them.
  return remainingEngagements;
}
