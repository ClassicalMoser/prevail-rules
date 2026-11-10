import type { PlayerSide } from '@entities';
import type { CardState, OwnedCardState } from '@game';
import { findOwnedPlayerCardState } from './findOwnedPlayerCardState';

/**
 * Returns the owned card slice for `player`, proven via `cardState.visibility`,
 * for a caller that knows this view can see it.
 *
 * No casts: `findOwnedPlayerCardState` reads a field TypeScript already types
 * as {@link OwnedCardState}. Use that to ask whether the hand is in view.
 *
 * @param cardState - The card state, under some visibility
 * @param player - The player whose piles to read
 * @returns That player's owned piles
 * @throws Error when that player's hand is hidden under this visibility
 */
export function getOwnedPlayerCardState(
  cardState: CardState,
  player: PlayerSide,
): OwnedCardState {
  const owned = findOwnedPlayerCardState(cardState, player);
  if (owned === undefined) {
    throw new Error(
      `Player ${player} is not owned under ${cardState.visibility} visibility`,
    );
  }
  return owned;
}
