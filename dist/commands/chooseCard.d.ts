import type { Card } from "src/entities/card/card.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import { z } from "zod";
/** The schema for a choose card command. */
export declare const chooseCardCommandSchema: z.ZodObject<{
    /** The player who is choosing the card. */
    player: z.ZodEnum<["black", "white"]>;
    /** The card to choose from the player's hand. */
    card: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        initiative: z.ZodNumber;
        ranged: z.ZodBoolean;
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
        inspirationRange: z.ZodNumber;
        inspirationEffectText: z.ZodString;
        inspirationEffect: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodVoid>;
        globalEffectText: z.ZodOptional<z.ZodString>;
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
}, "strip", z.ZodTypeAny, {
    player: "black" | "white";
    card: {
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
    };
}, {
    player: "black" | "white";
    card: {
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
    };
}>;
/** A command to choose a card from the player's hand. */
export interface ChooseCardCommand {
    /** The player who is choosing the card. */
    player: PlayerSide;
    /** The card to choose from the player's hand. */
    card: Card;
}
//# sourceMappingURL=chooseCard.d.ts.map