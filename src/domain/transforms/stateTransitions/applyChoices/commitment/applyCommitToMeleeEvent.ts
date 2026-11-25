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
 * When a card is committed, discards that card from hand.
 * Event is assumed pre-validated (resolveMelee phase, player's commitment pending).
 * The committed card is the real card.
 */
export function applyCommitToMeleeEvent<S extends GameState>(
  event: CommitToMeleeEvent,
  state: S,
): S {
  // The melee being fought; each side may commit one card for its unit
  // (§7.2.2).
  const meleeState = getMeleeResolutionState(state);
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

  // The first player commits first, then the second (§7.2.2), and the melee
  // keeps one slot for each: who holds the initiative says which is this
  // player's.
  const newMeleeState = {
    ...meleeState,
    ...(hasInitiative(state, player)
      ? { firstPlayerCommitment: newCommitment }
      : { secondPlayerCommitment: newCommitment }),
  };
  const committed = updateMeleeResolutionState(stateWithCards, newMeleeState);

  // Once both slots are settled, the expected engine asks for the attack.
  return committed;
}
