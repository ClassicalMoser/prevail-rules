import type { PlayerSide } from '@entities';
import type { CardState, OwnedCardState } from '@game';

/**
 * Returns the owned card slice for `player`, proven via `cardState.visibility`.
 *
 * No casts: each branch reads a field TypeScript already types as
 * {@link OwnedCardState}. Throws if that player is hidden under this visibility.
 */
export function getOwnedPlayerCardState(
  cardState: CardState,
  player: PlayerSide,
): OwnedCardState {
  const visibility = cardState.visibility;
  switch (visibility) {
    case 'authoritative': {
      return cardState[player];
    }
    case 'blackSeen': {
      if (player !== 'black') {
        throw new Error(
          `Player ${player} is not owned under blackSeen visibility`,
        );
      }
      return cardState.black;
    }
    case 'whiteSeen': {
      if (player !== 'white') {
        throw new Error(
          `Player ${player} is not owned under whiteSeen visibility`,
        );
      }
      return cardState.white;
    }
    default: {
      const _exhaustive: never = visibility;
      throw new Error(`Invalid visibility: ${visibility}`);
    }
  }
}
