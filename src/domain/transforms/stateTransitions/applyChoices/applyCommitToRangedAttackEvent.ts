import type { CommitToRangedAttackEvent } from '@events';
import type { GameState, RangedAttackResolutionState } from '@game';
import { getRangedAttackResolutionState } from '@queries';
import { updateCommandResolutionState } from '@transforms/pureTransforms';

import {
  applyCommitCardDiscard,
  commitmentFromCommittedCard,
} from './commitApplyHelpers';

/**
 * Applies a CommitToRangedAttackEvent: the shooter's owner commits a card for
 * the shot, or refuses, after naming the shooter and before naming its target
 * (§4.3.11 step 2). A committed card leaves its hand for the discard pile
 * (§8.1), and the shot records it as the shooter's commitment: its Range is
 * read when the target is chosen, its Attack when the shot lands.
 *
 * Event is assumed pre-validated (a shot is waiting on its shooter's
 * commitment, and the player owns the shooter). The committed card is the
 * real card.
 */
export function applyCommitToRangedAttackEvent<S extends GameState>(
  event: CommitToRangedAttackEvent,
  state: S,
): S {
  const shot = getRangedAttackResolutionState(state);

  // A committed card is spent from the hand until the next rally (§8.1).
  const stateWithCards = applyCommitCardDiscard(
    state,
    event.player,
    event.committedCard,
  );

  // The shot remembers what the shooter committed, for the aim and the blow.
  const committedShot: RangedAttackResolutionState = {
    ...shot,
    attackingCommitment: commitmentFromCommittedCard(event.committedCard),
  };
  const committed = updateCommandResolutionState(stateWithCards, committedShot);
  return committed;
}
