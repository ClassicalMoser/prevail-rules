import type { PlayerChoiceType } from '@events';
import type { AssertExact } from '@utils';
import { playerChoiceTypeSchema } from '@events';
import { z } from 'zod';

/** Iterable list of valid player sources. */
export const playerSources = ['white', 'black', 'bothPlayers'] as const;

/** Type for a player source. */
export type PlayerSource = (typeof playerSources)[number];

/** Schema for a player source. */
const _playerSourceSchemaObject = z.enum(playerSources);

type PlayerSourceSchemaType = z.infer<typeof _playerSourceSchemaObject>;

const _assertExactPlayerSource: AssertExact<
  PlayerSource,
  PlayerSourceSchemaType
> = true;

/** The schema for a player source. */
export const playerSourceSchema: z.ZodType<PlayerSource> =
  _playerSourceSchemaObject;

/**
 * Expected event is player input (wait for user).
 */
export interface ExpectedPlayerInput {
  /** Discriminator for the union. */
  actionType: 'playerChoice';
  /** Which player(s) can provide this input. */
  playerSource: PlayerSource;
  /** The specific choice type expected. */
  choiceType: PlayerChoiceType;
}

const _expectedPlayerInputSchemaObject = z.object({
  actionType: z.literal('playerChoice'),
  playerSource: playerSourceSchema,
  choiceType: playerChoiceTypeSchema,
});

type ExpectedPlayerInputSchemaType = z.infer<
  typeof _expectedPlayerInputSchemaObject
>;

const _assertExactExpectedPlayerInput: AssertExact<
  ExpectedPlayerInput,
  ExpectedPlayerInputSchemaType
> = true;

/** The schema for expected player input. */
export const expectedPlayerInputSchema: z.ZodObject<{
  actionType: z.ZodLiteral<'playerChoice'>;
  playerSource: typeof playerSourceSchema;
  choiceType: typeof playerChoiceTypeSchema;
}> = _expectedPlayerInputSchemaObject;
