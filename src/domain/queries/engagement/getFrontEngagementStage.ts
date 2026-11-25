import type { FrontEngagementResolutionState } from '@game';
import { isPending, throwIfBypassed } from '@utils';

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
  // The defender may commit a card before anything else (§6.3.2, step 1).
  if (resolution.defensiveCommitment.commitmentType === 'pending') {
    return 'defenderCommitting';
  }

  // Its Speed against the mover's, and the retreats it could make, are still
  // to be worked out (§6.3.2, step 2).
  if (isPending(resolution.retreatPaths)) {
    return 'retreatBeingWorkedOut';
  }

  // No path to fall back along: the defender stands (§6.3.2).
  if (resolution.retreatPaths.length === 0) {
    return 'noRetreat';
  }

  // It may fall back, and the choice is the defender's to make.
  if (isPending(resolution.defendingUnitRetreats)) {
    return 'defenderDeciding';
  }

  // It chose to stay locked in, to fight in Phase 4 (§6.3.2, step 4).
  if (!resolution.defendingUnitRetreats) {
    return 'defenderStands';
  }

  // It chose to fall back, and the retreat has not been opened yet.
  if (isPending(resolution.retreatState)) {
    return 'retreatOpening';
  }

  // A defender that chose to fall back has its retreat bypassed only by a
  // fault in whatever recorded the choice.
  const retreat = throwIfBypassed(
    resolution.retreatState,
    'A defender that falls back has its retreat bypassed',
  );

  // The retreat is under way, or done; once done the engagement ends with no
  // melee (§6.3.2, step 3).
  const stage: FrontEngagementStage = retreat.completed
    ? 'retreated'
    : 'retreating';
  return stage;
}
