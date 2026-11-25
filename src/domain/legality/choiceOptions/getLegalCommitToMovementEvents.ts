import type { PlayerSide } from '@entities';
import type { CommitToMovementEvent } from '@events';
import type { GameState } from '@game';
import { MOVEMENT_COMMITMENT_MODIFIERS } from '@ruleValues';
import { createCommitToMovementEvent } from '@factories';
import {
  findFrontEngagementStateFromMovement,
  findMovementResolutionState,
  getFrontEngagementStage,
  getOtherPlayer,
} from '@queries';
import { getCommitmentOffers } from './commitment';

/**
 * Player whose commit-to-movement is pending: either the moving unit (CRS
 * commitment) or the front-engagement defender (defensive commitment).
 *
 * @param gameState - The game state, carrying out a Move order
 * @returns The player to ask
 * @throws Error when no movement is being carried out, or neither of its
 * commitments is owed
 */
function pendingCommitPlayer<S extends GameState>(gameState: S): PlayerSide {
  // A commitment is owed only while a movement is being carried out.
  const movement = findMovementResolutionState(gameState);
  if (movement === undefined) {
    throw new Error('No movement is being carried out');
  }

  // The moving player may commit before the unit sets off (§4.3.10 step 2).
  if (movement.commitment.commitmentType === 'pending') {
    const mover = movement.movingUnit.playerSide;
    return mover;
  }

  // A front engagement's defender may commit at the start of it (§6.3.2).
  // A flanked defender is turned and a rear-struck one routs (§6.3.3,
  // §6.3.4), so neither is offered a commitment, and nor is a move that has
  // met no one.
  const front = findFrontEngagementStateFromMovement(gameState);
  if (
    front !== undefined &&
    getFrontEngagementStage(front.engagementResolutionState) ===
      'defenderCommitting'
  ) {
    // The defender is the other side from the unit that moved into it.
    const defender = getOtherPlayer(movement.movingUnit.playerSide);
    return defender;
  }

  // The mover has committed or refused, and no defender is owed one.
  throw new Error('No movement commitment is owed');
}

/**
 * Returns every legal commit-to-movement event for the player whose movement
 * (or front-engagement defensive) commitment is still pending: one event per
 * in-hand card that has at least one movement-applicable modifier, plus a
 * refuse option (`committedCard: 'none'`).
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
  // Only the player whose turn it is to commit in this move is asked.
  const player = pendingCommitPlayer(gameState);

  // Each card in hand naming a stat this commitment applies, then the
  // refusal, which is always open (§8.3, §8.4).
  const offers = getCommitmentOffers(
    gameState.cardState,
    player,
    MOVEMENT_COMMITMENT_MODIFIERS,
  );

  // Each offer becomes the event that player would send to make it.
  const events = offers.map((offer) =>
    createCommitToMovementEvent({
      committedCard: offer.committedCard,
      player,
    }),
  );

  // What `isValidCommitToMovementEvent` checks a submitted commitment against.
  return events;
}
