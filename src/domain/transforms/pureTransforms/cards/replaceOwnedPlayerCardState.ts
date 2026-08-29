import type { PlayerSide } from '@entities';
import type { CardState, OwnedCardState } from '@game';

/**
 * Replaces the owned card slice for `player` within a {@link CardState}.
 * Visibility discriminant is preserved — no casts.
 *
 * @throws if that player is hidden under this visibility
 */
export function replaceOwnedPlayerCardState(
  cardState: CardState,
  player: PlayerSide,
  owned: OwnedCardState,
): CardState {
  switch (cardState.visibility) {
    case 'authoritative': {
      return {
        ...cardState,
        [player]: owned,
      };
    }
    case 'whiteSeen': {
      if (player !== 'white') {
        throw new Error(
          `Player ${player} is not owned under whiteSeen visibility`,
        );
      }
      return {
        ...cardState,
        white: owned,
      };
    }
    case 'blackSeen': {
      if (player !== 'black') {
        throw new Error(
          `Player ${player} is not owned under blackSeen visibility`,
        );
      }
      return {
        ...cardState,
        black: owned,
      };
    }
    default: {
      const _exhaustive: never = cardState;
      throw new Error(`Invalid card state: ${_exhaustive}`);
    }
  }
}
