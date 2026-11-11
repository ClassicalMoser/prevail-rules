import type { FrontEngagementResolutionState } from '@game';

/**
 * Where a front engagement stands (§6.3). The defender first commits a card
 * or refuses; then whether it has anywhere to fall back to is worked out
 * (§9.1.5); a defender that has somewhere decides whether to; a defender that
 * falls back has its retreat opened, carried out and finished.
 */
export type FrontEngagementStage =
  /** The defender's commitment is owed. */
  | 'defenderCommitting'
  /** Whether the defender can fall back is still to be worked out. */
  | 'retreatBeingWorkedOut'
  /** The defender has nowhere to fall back to, and stands. */
  | 'noRetreat'
  /** The defender is deciding whether to fall back. */
  | 'defenderDeciding'
  /** The defender chose to stand. */
  | 'defenderStands'
  /** The defender chose to fall back, and the retreat is not yet open. */
  | 'retreatOpening'
  /** The retreat is open and not yet finished. */
  | 'retreating'
  /** The retreat is finished. */
  | 'retreated';

/**
 * The stage a front engagement has reached. This is the one reading of a
 * front engagement's progress: the sequencer and the legal options both
 * dispatch on it.
 *
 * @param resolution - The front engagement's resolution state
 * @returns The stage it has reached
 */
export function getFrontEngagementStage(
  resolution: FrontEngagementResolutionState,
): FrontEngagementStage {
  if (resolution.defensiveCommitment.commitmentType === 'pending') {
    return 'defenderCommitting';
  }
  if (resolution.retreatPaths === 'pending') {
    return 'retreatBeingWorkedOut';
  }
  // No path to fall back along: the defender stands (§6.3.2).
  if (resolution.retreatPaths.length === 0) {
    return 'noRetreat';
  }
  if (resolution.defendingUnitRetreats === 'pending') {
    return 'defenderDeciding';
  }
  if (!resolution.defendingUnitRetreats) {
    return 'defenderStands';
  }
  if (resolution.retreatState === 'pending') {
    return 'retreatOpening';
  }
  const stage: FrontEngagementStage = resolution.retreatState.completed
    ? 'retreated'
    : 'retreating';
  return stage;
}
