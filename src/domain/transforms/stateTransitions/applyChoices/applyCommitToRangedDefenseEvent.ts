import type { CommitToRangedDefenseEvent } from '@events';
import type { GameState, RangedAttackResolutionState } from '@game';
import { getRangedAttackResolutionState } from '@queries';
import { updateCommandResolutionState } from '@transforms/pureTransforms';

import {
  applyCommitCardDiscard,
  commitmentFromCommittedCard,
} from './commitApplyHelpers';

/**
 * Applies a CommitToRangedDefenseEvent: the target's owner commits a card
 * for Defence or Flexibility, or refuses (§4.3.11 step 5, B1). A committed card leaves its
 * hand for the discard pile (§8.1), and the shot records it as the target's
 * commitment, which raises the target's thresholds when the shot lands
 * (§8.5).
 *
 * Event is assumed pre-validated (a shot is waiting on its target's
 * commitment, and the player owns the target). The committed card is the
 * real card.
 */
export function applyCommitToRangedDefenseEvent<S extends GameState>(
  event: CommitToRangedDefenseEvent,
  state: S,
): S {
  const shot = getRangedAttackResolutionState(state);

  // A committed card is spent from the hand until the next rally (§8.1).
  const stateWithCards = applyCommitCardDiscard(
    state,
    event.player,
    event.committedCard,
  );

  // The shot remembers what the target committed, for when it is resolved.
  const defended: RangedAttackResolutionState = {
    ...shot,
    defendingCommitment: commitmentFromCommittedCard(event.committedCard),
  };
  const committed = updateCommandResolutionState(stateWithCards, defended);
  return committed;
}
