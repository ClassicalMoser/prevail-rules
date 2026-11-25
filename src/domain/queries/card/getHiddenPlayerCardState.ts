import type { PlayerSide } from '@entities';
import type { CardState, HiddenCardState } from '@game';

/**
 * Returns the hidden card slice for `player`, proven via `cardState.visibility`.
 *
 * No casts: each branch reads a field TypeScript already types as
 * {@link HiddenCardState}. Throws if that player is owned (or if visibility is
 * authoritative, which has no hidden side).
 */
export function getHiddenPlayerCardState(
  cardState: CardState,
  player: PlayerSide,
): HiddenCardState {
  const visibility = cardState.visibility;
  switch (visibility) {
    case 'authoritative': {
      // The full record hides no hand, so asking for a hidden one is a fault.
      throw new Error('No hidden player under authoritative visibility');
    }
    case 'whiteSeen': {
      // White's seat hides Black's hand; White's own is in view.
      if (player !== 'black') {
        throw new Error(
          `Player ${player} is not hidden under whiteSeen visibility`,
        );
      }
      return cardState.black;
    }
    case 'blackSeen': {
      // Black's seat hides White's hand; Black's own is in view.
      if (player !== 'white') {
        throw new Error(
          `Player ${player} is not hidden under blackSeen visibility`,
        );
      }
      return cardState.white;
    }
    case 'spectator': {
      // Both seats are hidden, so either slice is readable as hidden.
      return cardState[player];
    }
    default: {
      // Every visibility is handled above; only a value the type forbids
      // arrives here.
      const _exhaustiveCheck: never = visibility;
      throw new Error(`Invalid visibility: ${_exhaustiveCheck}`);
    }
  }
}
