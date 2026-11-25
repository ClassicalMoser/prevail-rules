import type { PlayerSide } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import type { GameState } from '@game';
import { MELEE_COMMITMENT_MODIFIERS } from '@ruleValues';
import { createCommitToMeleeEvent } from '@factories';
import {
  findMeleeResolutionState,
  findPlayerOwingMeleeCommitment,
} from '@queries';
import { getCommitmentOffers } from './commitment';

/**
 * The player whose melee commitment is owed. The first player commits
 * first, then the second (§7.2.2); once both have, nobody is asked.
 *
 * @param gameState - The game state
 * @returns The player to ask
 * @throws Error when no melee is being fought, or both have committed
 */
function pendingCommitPlayer<S extends GameState>(gameState: S): PlayerSide {
  // A commitment is owed only while a melee is being fought.
  const meleeState = findMeleeResolutionState(gameState);
  if (meleeState === undefined) {
    throw new Error('No melee is being fought');
  }

  // The first player commits first, then the second (§7.2.2); once both
  // have, nobody is asked.
  const owing = findPlayerOwingMeleeCommitment(gameState, meleeState);
  if (owing === undefined) {
    throw new Error('No melee commitment is owed');
  }

  // The player whose card, if any, is now to be laid down for their unit.
  return owing;
}

/**
 * Returns every legal commit-to-melee event for the player whose melee
 * commitment is still pending: one event per in-hand card that has at least
 * one melee-applicable modifier, plus a refuse option (`committedCard: 'none'`).
 *
 * Nothing asks unless a commitment is owed, so being asked then is the
 * caller's mistake and throws. When the hand is hidden, only the refuse
 * option is returned (card commits require an owned hand).
 *
 * @throws Error when no melee is being fought, or both have committed
 */
export function getLegalCommitToMeleeEvents<S extends GameState>(
  gameState: S,
): CommitToMeleeEvent[] {
  // Only the player whose turn it is to commit in this melee is asked.
  const player = pendingCommitPlayer(gameState);

  // Each card in hand naming a stat this commitment applies, then the
  // refusal, which is always open (§8.3, §8.4).
  const offers = getCommitmentOffers(
    gameState.cardState,
    player,
    MELEE_COMMITMENT_MODIFIERS,
  );

  // Each offer becomes the event that player would send to make it.
  const events = offers.map((offer) =>
    createCommitToMeleeEvent({
      committedCard: offer.committedCard,
      player,
    }),
  );

  // What `isValidCommitToMeleeEvent` checks a submitted commitment against.
  return events;
}
