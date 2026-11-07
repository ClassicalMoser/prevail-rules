import type { CommitToMeleeEvent } from '@events';
import type { GameState } from '@game';
import { getMeleeResolutionState, hasInitiative } from '@queries';
import { updateMeleeResolutionState } from '@transforms/pureTransforms';

import {
  applyCommitCardDiscard,
  commitmentFromCommittedCard,
} from './commitApplyHelpers';

/**
 * Applies a CommitToMeleeEvent to the game state.
 * Completes or declines the player's pending melee commitment.
 * When `committedCard` is non-null, discards that card from hand.
 * Event is assumed pre-validated (resolveMelee phase, player's commitment pending).
 * The committed card is the real card.
 */
export function applyCommitToMeleeEvent<S extends GameState>(
  event: CommitToMeleeEvent,
  state: S,
): S {
  const meleeState = getMeleeResolutionState(state);
  const { player } = event;

  const stateWithCards = applyCommitCardDiscard(
    state,
    player,
    event.committedCard,
  );

  const newCommitment = commitmentFromCommittedCard(event.committedCard);
  const newMeleeState = {
    ...meleeState,
    ...(hasInitiative(state, player)
      ? { firstPlayerCommitment: newCommitment }
      : { secondPlayerCommitment: newCommitment }),
  };

  return updateMeleeResolutionState(stateWithCards, newMeleeState);
}
