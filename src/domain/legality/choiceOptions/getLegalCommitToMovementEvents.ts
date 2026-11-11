import type { PlayerSide } from '@entities';
import type { CommitToMovementEvent } from '@events';
import type { GameState } from '@game';
import { MOVEMENT_COMMITMENT_MODIFIERS } from '@ruleValues';
import { createCommitToMovementEvent } from '@factories';
import {
  findMovementResolutionState,
  getFrontEngagementStage,
  getOtherPlayer,
} from '@queries';
import { getCommitmentOffers } from './commitment';

/**
 * Player whose commit-to-movement is pending: either the moving unit (CRS
 * commitment) or the front-engagement defender (defensive commitment).
 */
function pendingCommitPlayer<S extends GameState>(gameState: S): PlayerSide {
  // A commitment is owed only while a movement is being carried out.
  const crs = findMovementResolutionState(gameState);
  if (crs === undefined) {
    throw new Error('No movement is being carried out');
  }

  if (crs.commitment.commitmentType === 'pending') {
    return crs.movingUnit.unit.playerSide;
  }

  if (crs.engagementState === 'pending') {
    throw new Error('No movement commitment is owed');
  }

  // A front engagement's defender may commit at the start of it (§6.3.2).
  const engagement = crs.engagementState.engagementResolutionState;
  if (
    engagement.engagementType === 'front' &&
    getFrontEngagementStage(engagement) === 'defenderCommitting'
  ) {
    return getOtherPlayer(crs.engagementState.engagingUnit.playerSide);
  }

  throw new Error('No movement commitment is owed');
}

/**
 * Returns every legal commit-to-movement event for the player whose movement
 * (or front-engagement defensive) commitment is still pending: one event per
 * in-hand card that has at least one movement-applicable modifier, plus a
 * refuse option (`committedCard: null`).
 *
 * Nothing asks unless a commitment is owed, so being asked then is the
 * caller's mistake and throws. When the hand is hidden, only the refuse
 * option is returned (card commits require an owned hand).
 *
 * @throws Error when no movement is being carried out, or none of its
 * commitments is owed
 */
export function getLegalCommitToMovementEvents<S extends GameState>(
  gameState: S,
): CommitToMovementEvent[] {
  const player = pendingCommitPlayer(gameState);

  // Each card in hand naming a stat this commitment applies, then the
  // refusal, which is always open (§8.3, §8.4).
  const offers = getCommitmentOffers(
    gameState.cardState,
    player,
    MOVEMENT_COMMITMENT_MODIFIERS,
  );
  const events = offers.map((offer) =>
    createCommitToMovementEvent({
      committedCard: offer.committedCard,
      player,
    }),
  );
  return events;
}
