import type { PlayerSide } from '@entities';
import type { CardState, HiddenCardState } from '@game';

/**
 * Replaces the hidden card slice for `player` within a {@link CardState}.
 * Visibility discriminant is preserved — no casts.
 *
 * Hands are secret (§1.4): a seat holds its opponent's cards face down, and a
 * spectator holds both sides' that way. This writes back a player's cards in
 * that form, after a change `updatePlayerCards` or `applyChooseCardEvent`
 * made to them. It is the writer that matches `getHiddenPlayerCardState`.
 *
 * @param cardState - Both players' cards, under some visibility
 * @param player - The player whose face-down cards are written
 * @param hidden - Their new card piles
 * @returns The card state, same visibility, with that player's piles replaced
 * @throws if that player is owned under this visibility, or if visibility is
 *   authoritative (no hidden side)
 */
export function replaceHiddenPlayerCardState(
  cardState: CardState,
  player: PlayerSide,
  hidden: HiddenCardState,
): CardState {
  switch (cardState.visibility) {
    case 'authoritative': {
      // The full record hides no hand, so a face-down write is a fault.
      throw new Error('No hidden player under authoritative visibility');
    }
    case 'whiteSeen': {
      // White's seat hides only Black's hand.
      if (player !== 'black') {
        throw new Error(
          `Player ${player} is not hidden under whiteSeen visibility`,
        );
      }
      const whiteSeen: CardState = {
        ...cardState,
        black: hidden,
      };
      return whiteSeen;
    }
    case 'blackSeen': {
      // Black's seat hides only White's hand.
      if (player !== 'white') {
        throw new Error(
          `Player ${player} is not hidden under blackSeen visibility`,
        );
      }
      const blackSeen: CardState = {
        ...cardState,
        white: hidden,
      };
      return blackSeen;
    }
    case 'spectator': {
      // Both slices are hidden, so either seat can be replaced.
      const spectator: CardState = {
        ...cardState,
        [player]: hidden,
      };
      return spectator;
    }
    default: {
      // Every visibility is handled above; only a value the type forbids
      // arrives here.
      // TODO(misleading): the message interpolates the whole card state, so
      // it reads 'Invalid card state: [object Object]'. Settle by switching
      // on a named `visibility` and printing it, as
      // `getHiddenPlayerCardState` does.
      const _exhaustive: never = cardState;
      throw new Error(`Invalid card state: ${_exhaustive}`);
    }
  }
}
