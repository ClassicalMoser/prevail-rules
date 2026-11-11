import type { PlayerSide } from '@entities';
import type { CommitToMovementEvent } from '@events';
import type { GameState } from '@game';
import { movementModifierTypes } from '@events';
import { createCommitToMovementEvent } from '@factories';
import { getOtherPlayer, findMovementResolutionState } from '@queries';
import { getCommitmentOffers } from './commitment';

/**
 * Player whose commit-to-movement is pending: either the moving unit (CRS
 * commitment) or the front-engagement defender (defensive commitment).
 */
function pendingCommitPlayer<S extends GameState>(
  gameState: S,
): PlayerSide | null {
  // A commitment is owed only while a movement is being carried out.
  const crs = findMovementResolutionState(gameState);
  if (crs === undefined) {
    return null;
  }

  if (crs.commitment.commitmentType === 'pending') {
    return crs.movingUnit.unit.playerSide;
  }

  if (crs.engagementState === 'pending') {
    return null;
  }

  const engagement = crs.engagementState.engagementResolutionState;
  if (
    engagement.engagementType === 'front' &&
    engagement.defensiveCommitment.commitmentType === 'pending'
  ) {
    return getOtherPlayer(crs.engagementState.engagingUnit.playerSide);
  }

  return null;
}

/**
 * Returns every legal commit-to-movement event for the player whose movement
 * (or front-engagement defensive) commitment is still pending: one event per
 * in-hand card that has at least one movement-applicable modifier, plus a
 * refuse option (`committedCard: null`).
 *
 * Returns `[]` when commit is not expected. When the hand is hidden, only the
 * refuse option is returned (card commits require an owned hand).
 */
export function getLegalCommitToMovementEvents<S extends GameState>(
  gameState: S,
): CommitToMovementEvent[] {
  const player = pendingCommitPlayer(gameState);
  if (player === null) {
    return [];
  }

  // Each card in hand naming a stat this commitment applies, then the
  // refusal, which is always open (§8.3, §8.4).
  const offers = getCommitmentOffers(
    gameState.cardState,
    player,
    movementModifierTypes,
  );
  const events = offers.map((offer) =>
    createCommitToMovementEvent({
      committedCard: offer.committedCard,
      player,
    }),
  );
  return events;
}
