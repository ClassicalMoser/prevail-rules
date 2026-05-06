import type { PlayerChoiceType } from "@events/playerChoices";

/** Iterable list of valid player sources. */
export const playerSources = ["white", "black", "bothPlayers"] as const;

/** Type for a player source. */
export type PlayerSource = (typeof playerSources)[number];

/**
 * Expected event is player input (wait for user).
 * Board-agnostic: spatial payloads live on {@link PlayerChoiceEvent}, not here (Layer 4).
 */
export interface ExpectedPlayerInput {
  /** Discriminator for the union. */
  actionType: "playerChoice";
  /** Which player(s) can provide this input. */
  playerSource: PlayerSource;
  /** The specific choice type expected. */
  choiceType: PlayerChoiceType;
}
