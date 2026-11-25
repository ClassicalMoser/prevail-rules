import type { CommandCard, PlayerSide } from '@entities';
import type { GameState } from '@game';
import { throwIfUndefined } from '@utils';

/**
 * The card a player discarded last: the one on top of their discard pile.
 *
 * Discards are face up in every view (§1.4), so this is the state's own copy
 * of the card even where the player's hand is hidden. A commitment reads its
 * card here once the card has left the hand, so it holds what the card
 * prints rather than what a choice claimed.
 *
 * @param state - The game, under any card visibility
 * @param player - The player whose discard pile is read
 * @returns The card on top of that pile
 * @throws When the player has discarded nothing
 */
export function getTopDiscardedCard(
  state: GameState,
  player: PlayerSide,
): CommandCard {
  // Every view holds a player's discards in full, last discarded at the end.
  const { discarded } = state.cardState[player];

  // A caller asks only once a card has gone onto the pile.
  const top = throwIfUndefined(
    discarded.at(-1),
    `${player} has discarded no card`,
  );
  return top;
}
