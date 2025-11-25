import { z } from "zod";
/**
 * The iterable list of sizes of commands that can be used on a card.
 */
export const commandSizes = ["units", "lines", "groups"];
/**
 * The schema for the sizes of commands that can be used on a card.
 */
export const commandSizesSchema = z.enum(commandSizes);
const _assertExactCommandSize = true;
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
const _assertExactCommand = true;
