import type { AssertExact } from "src/utils/assertExact.js";
import { z } from "zod";

/**
 * The iterable list of sizes of commands that can be used on a card.
 */
export const commandSizes = ["units", "lines", "groups"] as const;

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
  /** The number of commands of this size to be used. */
  number: z.number().int().min(1).max(10),
  /** The traits that must be present on the units in the command. */
  traitRestrictions: z.array(z.string()),
  /** The unique identifiers of the unit types that can be included in the command. */
  unitRestrictions: z.array(z.string().uuid()),
});

// Helper type to check match of type against schema
type CommandSchemaType = z.infer<typeof commandSchema>;

/**
 * A command on a card.
 */
export interface Command {
  /** The size of the command. */
  size: CommandSize;
  /** The number of commands of this size to be used. */
  number: number;
  /** The traits that must be present on the units in the command. */
  traitRestrictions: string[];
  /** The unique identifiers of the unit types that can be included in the command. */
  unitRestrictions: string[]; // UUIDs of unit types
}

const _assertExactCommand: AssertExact<Command, CommandSchemaType> = true;
