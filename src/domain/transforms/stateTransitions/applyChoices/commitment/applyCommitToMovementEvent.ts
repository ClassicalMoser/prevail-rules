import type { CommitToMovementEvent } from '@events';
import type { GameState, MovementResolutionState } from '@game';
import {
  findFrontEngagementStateFromMovement,
  getFrontEngagementStage,
  getMovementResolutionState,
} from '@queries';
import {
  updateCommandResolutionState,
  updateFrontEngagementResolutionState,
} from '@transforms/pureTransforms';

import {
  applyCommitCardDiscard,
  commitmentFromCommittedCard,
} from './commitApplyHelpers';

/**
 * Applies a CommitToMovementEvent to the game state.
 * Completes or declines either:
 * - the moving unit's pending CRS `commitment`, or
 * - the front-engagement defender's pending `defensiveCommitment`.
 *
 * When a card is committed, discards that card from hand.
 * Event is assumed pre-validated (issueCommands phase, movement resolution).
 * The committed card is the real card.
 */
export function applyCommitToMovementEvent<S extends GameState>(
  event: CommitToMovementEvent,
  state: S,
): S {
  // The Move being carried out; both commitments of a move live in it.
  const movementState = getMovementResolutionState(state);
  const { player } = event;

  // A committed card is spent from the hand until the next rally (§8.1).
  const stateWithCards = applyCommitCardDiscard(
    state,
    player,
    event.committedCard,
  );

  // The card as the discard pile now holds it, or the refusal.
  const newCommitment = commitmentFromCommittedCard(
    stateWithCards,
    player,
    event.committedCard,
  );

  // Front-engagement defender commits/refuses into nested defensiveCommitment.
  // A defender met head on may commit for Speed or Flexibility before the two
  // Speeds are compared (§6.3.2 step 1). Only a front engagement offers it: a
  // flanked defender is turned and a rear-struck one routs (§6.3.3, §6.3.4).
  // The mover's own commitment came before it moved (§4.3.10), so once its
  // unit has met a defender, an owed commitment can only be the defender's.
  // TODO(composition): `getLegalCommitToMovementEvents` decides whose
  // commitment is owed in its own `pendingCommitPlayer`, asking the mover's
  // first; this asks the defender's first. They agree on every state play
  // reaches. Settle by one `@queries` reader naming the owed commitment, read
  // by both.
  const front = findFrontEngagementStateFromMovement(state);
  if (
    front !== undefined &&
    getFrontEngagementStage(front.engagementResolutionState) ===
      'defenderCommitting'
  ) {
    const defended = updateFrontEngagementResolutionState(stateWithCards, {
      defensiveCommitment: newCommitment,
    });

    // The defender's Speed, with its card, is compared next.
    return defended;
  }

  // Otherwise the commitment is the mover's, made before its unit sets off
  // (§4.3.10 step 2): its Speed and Flexibility for the move count the card.
  const newMovementState: MovementResolutionState = {
    ...movementState,
    commitment: newCommitment,
  };
  const committed = updateCommandResolutionState(
    stateWithCards,
    newMovementState,
  );

  // The move itself is written next.
  return committed;
}
