import type { PlayerSide } from '@entities';
import type { CardState, OwnedCardState } from '@game';

/**
 * Replaces the owned card slice for `player` within a {@link CardState}.
 * Visibility discriminant is preserved — no casts.
 *
 * A hand is in view to the full record and to its owner's seat (§1.4). This
 * writes back a player's cards in that form, after a change
 * `updatePlayerCards` or `applyChooseCardEvent` made to them. It is the
 * writer that matches `getOwnedPlayerCardState`.
 *
 * @param cardState - Both players' cards, under some visibility
 * @param player - The player whose cards in view are written
 * @param owned - Their new card piles
 * @returns The card state, same visibility, with that player's piles replaced
 * @throws if that player is hidden under this visibility
 */
export function replaceOwnedPlayerCardState(
  cardState: CardState,
  player: PlayerSide,
  owned: OwnedCardState,
): CardState {
  switch (cardState.visibility) {
    case 'authoritative': {
      // The full record holds every card, so either player can be written.
      const authoritative: CardState = {
        ...cardState,
        [player]: owned,
      };
      return authoritative;
    }
    case 'whiteSeen': {
      // White's seat sees only its own hand.
      if (player !== 'white') {
        throw new Error(
          `Player ${player} is not owned under whiteSeen visibility`,
        );
      }
      const whiteSeen: CardState = {
        ...cardState,
        white: owned,
      };
      return whiteSeen;
    }
    case 'blackSeen': {
      // Black's seat sees only its own hand.
      if (player !== 'black') {
        throw new Error(
          `Player ${player} is not owned under blackSeen visibility`,
        );
      }
      const blackSeen: CardState = {
        ...cardState,
        black: owned,
      };
      return blackSeen;
    }
    case 'spectator': {
      // Neither slice is owned, so an owned write is rejected for both seats.
      throw new Error(
        `Player ${player} is not owned under spectator visibility`,
      );
    }
    default: {
      // Every visibility is handled above; only a value the type forbids
      // arrives here.
      // TODO(misleading): the message interpolates the whole card state, so
      // it reads 'Invalid card state: [object Object]'. Settle by switching
      // on a named `visibility` and printing it, as
      // `findOwnedPlayerCardState` does.
      const _exhaustive: never = cardState;
      throw new Error(`Invalid card state: ${_exhaustive}`);
    }
  }
}
