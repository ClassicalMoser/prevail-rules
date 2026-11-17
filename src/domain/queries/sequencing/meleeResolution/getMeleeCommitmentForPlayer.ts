import type { PlayerSide } from '@entities';
import type { Commitment, GameState, MeleeResolutionState } from '@game';
import { hasInitiative } from '@queries/player';

/**
 * The commitment one player has made to a melee: a card committed for
 * their own unit, a refusal, or nothing yet (§7.2.2, §8.4.1).
 *
 * A melee holds its commitments in the order they are asked for, the first
 * player's first, so a side's own is the first or the second by who holds
 * the initiative this round.
 *
 * @param gameState - The game state, for who is the first player
 * @param meleeState - The melee being fought
 * @param player - The side whose commitment is wanted
 * @returns That side's commitment to this melee
 */
export function getMeleeCommitmentForPlayer(
  gameState: GameState,
  meleeState: MeleeResolutionState,
  player: PlayerSide,
): Commitment {
  // The first player commits first (§7.2.2), so their card is held first.
  if (hasInitiative(gameState, player)) {
    return meleeState.firstPlayerCommitment;
  }

  // The other side answered second, and its card is held second.
  return meleeState.secondPlayerCommitment;
}
