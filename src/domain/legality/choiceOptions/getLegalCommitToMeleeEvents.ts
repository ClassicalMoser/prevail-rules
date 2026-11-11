import type { PlayerSide } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import type { GameState } from '@game';
import { meleeModifierTypes } from '@events';
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
  return owing;
}

/**
 * Returns every legal commit-to-melee event for the player whose melee
 * commitment is still pending: one event per in-hand card that has at least
 * one melee-applicable modifier, plus a refuse option (`committedCard: null`).
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
  const player = pendingCommitPlayer(gameState);

  // Each card in hand naming a stat this commitment applies, then the
  // refusal, which is always open (§8.3, §8.4).
  const offers = getCommitmentOffers(
    gameState.cardState,
    player,
    meleeModifierTypes,
  );
  const events = offers.map((offer) =>
    createCommitToMeleeEvent({
      committedCard: offer.committedCard,
      player,
    }),
  );
  return events;
}
