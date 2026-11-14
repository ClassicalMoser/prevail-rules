import type { PlayerChoiceType } from '@events/playerChoices';

/**
 * Who is asked for a choice: one side, or both at once, as when both choose
 * their cards in secret (§4.1.1).
 */
export const playerSources = ['white', 'black', 'bothPlayers'] as const;

/** Type for a player source. */
export type PlayerSource = (typeof playerSources)[number];

/**
 * The next event is a player's choice: who makes it, and which choice. It
 * names only the kind of choice. The legal options are enumerated from the
 * state, board included, by `getLegalPlayerChoiceOptions`, and the choice
 * made is a {@link PlayerChoiceEvent}.
 */
export interface ExpectedPlayerInput {
  /** Marks a player choice, not a game effect. */
  actionType: 'playerChoice';
  /** Who is asked: one side, or both at once. */
  playerSource: PlayerSource;
  /** Which choice is asked for. */
  choiceType: PlayerChoiceType;
}
