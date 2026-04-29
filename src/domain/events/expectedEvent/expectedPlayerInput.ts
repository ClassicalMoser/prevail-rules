import type { PlayerChoiceType } from "@events/playerChoices";
import type { AssertExact } from "@utils";
import { playerChoiceTypeSchema } from "@events/playerChoices";
import { z } from "zod";

/** Iterable list of valid player sources. */
export const playerSources = ["white", "black", "bothPlayers"] as const;

/** Type for a player source. */
export type PlayerSource = (typeof playerSources)[number];

/** Schema for a player source. */
const _playerSourceSchemaObject = z.enum(playerSources);

type PlayerSourceSchemaType = z.infer<typeof _playerSourceSchemaObject>;

/** The schema for a player source. */
export const playerSourceSchema: z.ZodType<PlayerSource> = _playerSourceSchemaObject;

const _assertExactPlayerSource: AssertExact<PlayerSource, PlayerSourceSchemaType> = true;

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

const _expectedPlayerInputSchemaObject = z.object({
  actionType: z.literal("playerChoice"),
  playerSource: playerSourceSchema,
  choiceType: playerChoiceTypeSchema,
});

type ExpectedPlayerInputSchemaType = z.infer<typeof _expectedPlayerInputSchemaObject>;

/** The schema for expected player input. */
export const expectedPlayerInputSchema: z.ZodObject<{
  actionType: z.ZodLiteral<"playerChoice">;
  playerSource: typeof playerSourceSchema;
  choiceType: typeof playerChoiceTypeSchema;
}> = _expectedPlayerInputSchemaObject;

const _assertExactExpectedPlayerInput: AssertExact<
  ExpectedPlayerInput,
  ExpectedPlayerInputSchemaType
> = true;
