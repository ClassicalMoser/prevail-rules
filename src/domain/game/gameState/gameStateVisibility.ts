import type {
  AuthoritativeCardState,
  BlackSeenCardState,
  CardState,
  WhiteSeenCardState,
} from '@game/cardState';

/** Visibility regime for {@link CardState}, reused as the game-state visibility axis. */
export type GameStateVisibility = CardState['visibility'];

/** Maps a visibility literal to its corresponding card-state shape. */
export type CardStateForVisibility<V extends GameStateVisibility> =
  V extends 'authoritative'
    ? AuthoritativeCardState
    : V extends 'whiteSeen'
      ? WhiteSeenCardState
      : BlackSeenCardState;
