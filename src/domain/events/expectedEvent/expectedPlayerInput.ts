import type { PlayerChoiceType } from '@events/playerChoices';
import type { PlayerSide } from '@entities';
import { playerSides } from '@entities';

/** Both sides at once, as when both choose their cards in secret (§4.1.1). */
export const BOTH_PLAYERS_SOURCE = 'bothPlayers' as const;

/** Type for a player source. */
export type PlayerSource = PlayerSide | typeof BOTH_PLAYERS_SOURCE;

/**
 * Who is asked for a choice: one side, or both at once, as when both choose
 * their cards in secret (§4.1.1).
 */
export const playerSources: PlayerSource[] = [
  ...playerSides,
  BOTH_PLAYERS_SOURCE,
] as const;

/**
 * The next event is a player's choice: who makes it, and which choice. It
 * names only the kind of choice. The legal options are enumerated from the
 * state, board included, by `getLegalPlayerChoiceOptions`, and the choice
 * made is a `PlayerChoiceEvent`.
 */
export interface ExpectedPlayerInput {
  /** Marks a player choice, not a game effect. */
  actionType: 'playerChoice';
  /** Who is asked: one side, or both at once. */
  playerSource: PlayerSource;
  /** Which choice is asked for. */
  choiceType: PlayerChoiceType;
}
