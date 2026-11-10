import type { PlayerSide } from '@entities';
import type { CardState, OwnedCardState } from '@game';

/**
 * The player's own card piles, as this view of the game can see them, or
 * `undefined` when it cannot. A hand is in view to the full record and to its
 * owner's seat; an opponent's seat and a spectator see only how many cards
 * it holds.
 *
 * A hidden hand is an ordinary state for a seated client, so this answers
 * rather than throwing. Callers that know the hand must be in view use
 * `getOwnedPlayerCardState`.
 *
 * @param cardState - The card state, under some visibility
 * @param player - The player whose piles to read
 * @returns That player's owned piles, or `undefined` when this view cannot see them
 * @throws Error when the visibility is not one the game knows
 */
export function findOwnedPlayerCardState(
  cardState: CardState,
  player: PlayerSide,
): OwnedCardState | undefined {
  const visibility = cardState.visibility;
  switch (visibility) {
    case 'authoritative': {
      return cardState[player];
    }
    case 'blackSeen': {
      if (player !== 'black') {
        return undefined;
      }
      return cardState.black;
    }
    case 'whiteSeen': {
      if (player !== 'white') {
        return undefined;
      }
      return cardState.white;
    }
    case 'spectator': {
      // A spectator view has no owned slice.
      return undefined;
    }
    default: {
      const _exhaustiveCheck: never = visibility;
      throw new Error(`Invalid visibility: ${_exhaustiveCheck}`);
    }
  }
}
