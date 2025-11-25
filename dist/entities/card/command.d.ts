import { z } from "zod";
/**
 * The iterable list of sizes of commands that can be used on a card.
 */
export declare const commandSizes: readonly ["units", "lines", "groups"];
/**
 * The schema for the sizes of commands that can be used on a card.
 */
export declare const commandSizesSchema: z.ZodEnum<["units", "lines", "groups"]>;
/**
 * The sizes of commands that can be used on a card.
 */
export type CommandSize = (typeof commandSizes)[number];
/**
 * The schema for a command on a card.
 */
export declare const commandSchema: z.ZodObject<{
    /** The size of the command. */
    size: z.ZodEnum<["units", "lines", "groups"]>;
    /** The number of commands of this size to be used. */
    number: z.ZodNumber;
    /** The traits that must be present on the units in the command. */
    traitRestrictions: z.ZodArray<z.ZodString, "many">;
    /** The unique identifiers of the unit types that can be included in the command. */
    unitRestrictions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    number: number;
    size: "units" | "lines" | "groups";
    traitRestrictions: string[];
    unitRestrictions: string[];
}, {
    number: number;
    size: "units" | "lines" | "groups";
    traitRestrictions: string[];
    unitRestrictions: string[];
}>;
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
    unitRestrictions: string[];
}
//# sourceMappingURL=command.d.ts.map