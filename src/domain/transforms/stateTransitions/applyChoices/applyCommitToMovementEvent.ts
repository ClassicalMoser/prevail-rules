import type {
  CommitToMovementEvent,
  ProjectedCommitToMovementEvent,
} from '@events';
import type { GameState, MovementResolutionState } from '@game';
import {
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
} from '@queries';
import {
  updateCommandResolutionState,
  updateEngagementStateInMovement,
} from '@transforms/pureTransforms';

import {
  applyCommitCardDiscard,
  commitmentFromCommittedCard,
} from './commitApplyHelpers';

type CommitToMovementApplyEvent =
  | CommitToMovementEvent
  | ProjectedCommitToMovementEvent;

/**
 * Applies a CommitToMovementEvent to the game state.
 * Completes or declines either:
 * - the moving unit's pending CRS `commitment`, or
 * - the front-engagement defender's pending `defensiveCommitment`.
 *
 * When `committedCard` is non-null, discards that card from hand.
 * Event is assumed pre-validated (issueCommands phase, movement resolution).
 *
 * Owned seats use full card identity. Unowned seats on seen views apply a
 * projected event (`committedCard: 'hidden'`).
 */
export function applyCommitToMovementEvent<S extends GameState>(
  event: CommitToMovementApplyEvent,
  state: S,
): S {
  const movementState = getMovementResolutionState(state);
  const { player } = event;

  const stateWithCards = applyCommitCardDiscard(
    state,
    player,
    event.committedCard,
  );

  const newCommitment = commitmentFromCommittedCard(event.committedCard);

  // Front-engagement defender commits/refuses into nested defensiveCommitment.
  if (
    movementState.engagementState !== 'pending' &&
    movementState.engagementState.engagementResolutionState.engagementType ===
      'front' &&
    movementState.engagementState.engagementResolutionState.defensiveCommitment
      .commitmentType === 'pending'
  ) {
    const engagementState = getFrontEngagementStateFromMovement(stateWithCards);
    return updateEngagementStateInMovement(stateWithCards, {
      ...engagementState,
      engagementResolutionState: {
        ...engagementState.engagementResolutionState,
        defensiveCommitment: newCommitment,
      },
    });
  }

  const newMovementState: MovementResolutionState = {
    ...movementState,
    commitment: newCommitment,
  };

  return updateCommandResolutionState(stateWithCards, newMovementState);
}
