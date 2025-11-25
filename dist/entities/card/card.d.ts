import type { Command } from "./command.js";
import { z } from "zod";
/**
 * The schema for a card.
 */
export declare const cardSchema: z.ZodObject<{
    /** The unique identifier of the card. */
    id: z.ZodString;
    /** The name of the card, regardless of version. */
    name: z.ZodString;
    /** The initiative value of the card. */
    initiative: z.ZodNumber;
    /** Whether the card allows ranged attacks. */
    ranged: z.ZodBoolean;
    /** The command to be used on the card. */
    command: z.ZodObject<{
        size: z.ZodEnum<["units", "lines", "groups"]>;
        number: z.ZodNumber;
        traitRestrictions: z.ZodArray<z.ZodString, "many">;
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
    /** The range of the inspiration effect. */
    inspirationRange: z.ZodNumber;
    /** The text describing the effect of the inspiration. */
    inspirationEffectText: z.ZodString;
    /** The effect of the inspiration. */
    inspirationEffect: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodVoid>;
    /** The text describing the global effect, if any. */
    globalEffectText: z.ZodOptional<z.ZodString>;
    /** The global effect, if any. */
    globalEffect: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodVoid>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    initiative: number;
    ranged: boolean;
    command: {
        number: number;
        size: "units" | "lines" | "groups";
        traitRestrictions: string[];
        unitRestrictions: string[];
    };
    inspirationRange: number;
    inspirationEffectText: string;
    inspirationEffect: (...args: unknown[]) => void;
    globalEffectText?: string | undefined;
    globalEffect?: ((...args: unknown[]) => void) | undefined;
}, {
    id: string;
    name: string;
    initiative: number;
    ranged: boolean;
    command: {
        number: number;
        size: "units" | "lines" | "groups";
        traitRestrictions: string[];
        unitRestrictions: string[];
    };
    inspirationRange: number;
    inspirationEffectText: string;
    inspirationEffect: (...args: unknown[]) => void;
    globalEffectText?: string | undefined;
    globalEffect?: ((...args: unknown[]) => void) | undefined;
}>;
/**
 * A card in the game.
 */
export interface Card {
    /** The unique identifier of the card. */
    id: string;
    /** The name of the card, regardless of version. */
    name: string;
    /** The initiative value of the card. */
    initiative: number;
    /** Whether the card allows ranged attacks. */
    ranged: boolean;
    /** The command to be used on the card. */
    command: Command;
    /** The range of the inspiration effect. */
    inspirationRange: number;
    /** The text describing the effect of the inspiration. */
    inspirationEffectText: string;
    /** The effect of the inspiration. */
    inspirationEffect: () => void;
    /** The text describing the global effect, if any. */
    globalEffectText?: string;
    /** The global effect, if any. */
    globalEffect?: () => void;
}
//# sourceMappingURL=card.d.ts.map