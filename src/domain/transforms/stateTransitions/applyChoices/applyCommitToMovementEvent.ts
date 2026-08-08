import type { CommitToMovementEvent } from '@events';
import type {
  Commitment,
  GameState,
  MovementResolutionState,
  OwnedPlayerForGameState,
} from '@game';
import {
  getFrontEngagementStateFromMovement,
  getMovementResolutionState,
  getOwnedPlayerCardState,
} from '@queries';
import {
  discardCardsFromHand,
  updateCommandResolutionState,
  updateEngagementStateInMovement,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

function completedOrDeclinedCommitment(
  event: CommitToMovementEvent,
): Commitment {
  if (event.committedCard === null) {
    return { commitmentType: 'declined' };
  }
  return {
    card: event.committedCard,
    commitmentType: 'completed',
  };
}

/**
 * Applies a CommitToMovementEvent to the game state.
 * Completes or declines either:
 * - the moving unit's pending CRS `commitment`, or
 * - the front-engagement defender's pending `defensiveCommitment`.
 *
 * When `committedCard` is non-null, discards that card from hand.
 * Event is assumed pre-validated (issueCommands phase, movement resolution).
 *
 * `event.player` must be owned under game state `S`.
 */
export function applyCommitToMovementEvent<S extends GameState>(
  event: CommitToMovementEvent & { player: OwnedPlayerForGameState<S> },
  state: S,
): S {
  const movementState = getMovementResolutionState(state);
  const { player } = event;

  let stateWithCards = state;
  if (event.committedCard !== null) {
    const ownedPlayerCardState = getOwnedPlayerCardState(
      state.cardState,
      player,
    );
    const discardedCardState = discardCardsFromHand(ownedPlayerCardState, [
      event.committedCard.id,
    ]);
    stateWithCards = updatePlayerCardState(state, player, discardedCardState);
  }

  const newCommitment = completedOrDeclinedCommitment(event);

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
