import type { Modifier } from "@entities/card/modifiers.js";
import type { Restrictions } from "@entities/card/restrictions.js";
import type { AssertExact } from "@utils/assertExact.js";
import { modifierSchema } from "@entities/card/modifiers.js";
import { restrictionsSchema } from "@entities/card/restrictions.js";
import { z } from "zod";

/**
 * The iterable list of types of commands that can be used on a card.
 */
export const commandTypes = ["movement", "rangedAttack"] as const;

/**
 * The schema for the types of commands that can be used on a card.
 */
export const commandTypesSchema = z.enum(commandTypes);

// Helper type to check match of type against schema
type CommandTypesSchemaType = z.infer<typeof commandTypesSchema>;

/**
 * The types of commands that can be used on a card.
 */
export type CommandType = (typeof commandTypes)[number];

const _assertExactCommandType: AssertExact<
  CommandType,
  CommandTypesSchemaType
> = true;

/**
 * The iterable list of sizes of commands that can be used on a card.
 */
export const commandSizes = ["units", "lines"] as const;

/**
 * The schema for the sizes of commands that can be used on a card.
 */
export const commandSizesSchema = z.enum(commandSizes);

// Helper type to check match of type against schema
type CommandSizesSchemaType = z.infer<typeof commandSizesSchema>;

/**
 * The sizes of commands that can be used on a card.
 */
export type CommandSize = (typeof commandSizes)[number];

const _assertExactCommandSize: AssertExact<
  CommandSize,
  CommandSizesSchemaType
> = true;

/**
 * The schema for a command on a card.
 */
export const commandSchema = z.object({
  /** The size of the command. */
  size: commandSizesSchema,
  /** The type of the command. */
  type: commandTypesSchema,
  /** The number of commands of this size to be used. */
  number: z.number().int().min(1).max(10),
  /** The restrictions on the command */
  restrictions: restrictionsSchema,
  /** The modifiers the command applies. */
  modifiers: z.array(modifierSchema),
});

// Helper type to check match of type against schema
type CommandSchemaType = z.infer<typeof commandSchema>;

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

const _assertExactCommand: AssertExact<Command, CommandSchemaType> = true;
