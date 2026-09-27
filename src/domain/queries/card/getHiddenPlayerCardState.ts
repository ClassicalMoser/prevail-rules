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
      throw new Error('No hidden player under authoritative visibility');
    }
    case 'whiteSeen': {
      if (player !== 'black') {
        throw new Error(
          `Player ${player} is not hidden under whiteSeen visibility`,
        );
      }
      return cardState.black;
    }
    case 'blackSeen': {
      if (player !== 'white') {
        throw new Error(
          `Player ${player} is not hidden under blackSeen visibility`,
        );
      }
      return cardState.white;
    }
    default: {
      const _exhaustiveCheck: never = visibility;
      throw new Error(`Invalid visibility: ${_exhaustiveCheck}`);
    }
  }
}
