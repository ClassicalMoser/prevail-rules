import type { CardState, HiddenCardState, PlayerSide } from '@entities';

/**
 * Replaces the hidden card slice for `player` within a {@link CardState}.
 * Visibility discriminant is preserved — no casts.
 *
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
      throw new Error('No hidden player under authoritative visibility');
    }
    case 'whiteSeen': {
      if (player !== 'black') {
        throw new Error(
          `Player ${player} is not hidden under whiteSeen visibility`,
        );
      }
      return {
        ...cardState,
        black: hidden,
      };
    }
    case 'blackSeen': {
      if (player !== 'white') {
        throw new Error(
          `Player ${player} is not hidden under blackSeen visibility`,
        );
      }
      return {
        ...cardState,
        white: hidden,
      };
    }
    default: {
      const _exhaustive: never = cardState;
      throw new Error(`Invalid card state: ${_exhaustive}`);
    }
  }
}
