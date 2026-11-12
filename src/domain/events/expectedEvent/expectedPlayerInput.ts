import type { PlayerChoiceType } from '@events/playerChoices';

/** Iterable list of valid player sources. */
export const playerSources = ['white', 'black', 'bothPlayers'] as const;

/** Type for a player source. */
export type PlayerSource = (typeof playerSources)[number];

/**
 * Expected event is player input (wait for user).
 * Board-agnostic: spatial payloads live on {@link PlayerChoiceEvent}, not here (Layer 4).
 * TODO(misleading): "Layer 4" names a layer by a number no document
 * defines. Settled by naming the layer, or dropping the reference.
 */
export interface ExpectedPlayerInput {
  /** Discriminator for the union. */
  actionType: 'playerChoice';
  /** Which player(s) can provide this input. */
  playerSource: PlayerSource;
  /** The specific choice type expected. */
  choiceType: PlayerChoiceType;
  /**
   * Other choice types the same players may make instead. A player asked to
   * give another order may stop and forfeit the orders left (§4.3.3), so
   * `issueCommand` also accepts `doneIssuingCommands`.
   */
  alsoAccepted?: PlayerChoiceType[];
}
