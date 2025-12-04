import type { Modifier, Restrictions } from '@entities';
import type { AssertExact } from '@utils';
import { z } from 'zod';
import { modifierSchema } from './modifiers';
import { restrictionsSchema } from './restrictions';

/**
 * The iterable list of types of commands that can be used on a card.
 */
export const commandTypes = ['movement', 'rangedAttack'] as const;

/**
 * The types of commands that can be used on a card.
 */
export type CommandType = (typeof commandTypes)[number];

const _commandTypesSchemaObject = z.enum(commandTypes);
type CommandTypesSchemaType = z.infer<typeof _commandTypesSchemaObject>;

/**
 * The schema for the types of commands that can be used on a card.
 */
export const commandTypesSchema: z.ZodType<CommandType> =
  _commandTypesSchemaObject;

// Verify manual type matches schema inference
const _assertExactCommandType: AssertExact<
  CommandType,
  CommandTypesSchemaType
> = true;

/**
 * The iterable list of sizes of commands that can be used on a card.
 */
export const commandSizes = ['units', 'lines'] as const;

/**
 * The sizes of commands that can be used on a card.
 */
export type CommandSize = (typeof commandSizes)[number];

const _commandSizesSchemaObject = z.enum(commandSizes);
type CommandSizesSchemaType = z.infer<typeof _commandSizesSchemaObject>;

/**
 * The schema for the sizes of commands that can be used on a card.
 */
export const commandSizesSchema: z.ZodType<CommandSize> =
  _commandSizesSchemaObject;

// Verify manual type matches schema inference
const _assertExactCommandSize: AssertExact<
  CommandSize,
  CommandSizesSchemaType
> = true;

/**
 * The restrictions of a card command on a card.
 */
export interface Command {
  /** The size of the command. */
  size: CommandSize;
  /** The type of the command. */
  type: CommandType;
  /** The number of commands of this size to be used. */
  number: number;
  /** The restrictions on the command */
  restrictions: Restrictions;
  /** The modifiers the command applies. */
  modifiers: Modifier[];
}

const _commandSchemaObject = z.object({
  /** The size of the command. */
  size: commandSizesSchema,
  /** The type of the command. */
  type: commandTypesSchema,
  /** The number of commands of this size to be used. */
  number: z.int().min(1).max(10),
  /** The restrictions on the command */
  restrictions: restrictionsSchema,
  /** The modifiers the command applies. */
  modifiers: z.array(modifierSchema),
});

type CommandSchemaType = z.infer<typeof _commandSchemaObject>;

/**
 * The schema for a command on a card.
 */
export const commandSchema: z.ZodType<Command> = _commandSchemaObject;

// Verify manual type matches schema inference
const _assertExactCommand: AssertExact<Command, CommandSchemaType> = true;
