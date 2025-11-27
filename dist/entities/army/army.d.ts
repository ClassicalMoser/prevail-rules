import type { Card } from "../card/card.js";
import type { UnitCount } from "./unitCount.js";
import { z } from "zod";
/**
 * The schema for an army of troops.
 */
export declare const armySchema: z.ZodObject<{
    /** The unique identifier of the army. */
    id: z.ZodString;
    /** The units in the army. */
    units: z.ZodSet<z.ZodObject<{
        unitType: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            traits: z.ZodArray<z.ZodEnum<["formation", "sword", "spear", "phalanx", "skirmish", "javelin", "mounted", "horse"]>, "many">;
            attack: z.ZodNumber;
            range: z.ZodNumber;
            speed: z.ZodNumber;
            flexibility: z.ZodNumber;
            reverse: z.ZodNumber;
            retreat: z.ZodNumber;
            rout: z.ZodNumber;
            cost: z.ZodNumber;
            limit: z.ZodNumber;
            routPenalty: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            reverse: number;
            id: string;
            name: string;
            traits: ("formation" | "sword" | "spear" | "phalanx" | "skirmish" | "javelin" | "mounted" | "horse")[];
            attack: number;
            range: number;
            speed: number;
            flexibility: number;
            retreat: number;
            rout: number;
            cost: number;
            limit: number;
            routPenalty: number;
        }, {
            reverse: number;
            id: string;
            name: string;
            traits: ("formation" | "sword" | "spear" | "phalanx" | "skirmish" | "javelin" | "mounted" | "horse")[];
            attack: number;
            range: number;
            speed: number;
            flexibility: number;
            retreat: number;
            rout: number;
            cost: number;
            limit: number;
            routPenalty: number;
        }>;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: ("formation" | "sword" | "spear" | "phalanx" | "skirmish" | "javelin" | "mounted" | "horse")[];
            attack: number;
            range: number;
            speed: number;
            flexibility: number;
            retreat: number;
            rout: number;
            cost: number;
            limit: number;
            routPenalty: number;
        };
        count: number;
    }, {
        unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: ("formation" | "sword" | "spear" | "phalanx" | "skirmish" | "javelin" | "mounted" | "horse")[];
            attack: number;
            range: number;
            speed: number;
            flexibility: number;
            retreat: number;
            rout: number;
            cost: number;
            limit: number;
            routPenalty: number;
        };
        count: number;
    }>>;
    /** The command cards in the army. */
    commandCards: z.ZodSet<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    units: Set<{
        unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: ("formation" | "sword" | "spear" | "phalanx" | "skirmish" | "javelin" | "mounted" | "horse")[];
            attack: number;
            range: number;
            speed: number;
            flexibility: number;
            retreat: number;
            rout: number;
            cost: number;
            limit: number;
            routPenalty: number;
        };
        count: number;
    }>;
    id: string;
    commandCards: Set<{
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
}, {
    units: Set<{
        unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: ("formation" | "sword" | "spear" | "phalanx" | "skirmish" | "javelin" | "mounted" | "horse")[];
            attack: number;
            range: number;
            speed: number;
            flexibility: number;
            retreat: number;
            rout: number;
            cost: number;
            limit: number;
            routPenalty: number;
        };
        count: number;
    }>;
    id: string;
    commandCards: Set<{
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
}>;
/**
 * An army of troops.
 */
export interface Army {
    /** The unique identifier of the army. */
    id: string;
    /** The units in the army. */
    units: Set<UnitCount>;
    /** The command cards in the army. */
    commandCards: Set<Card>;
}
//# sourceMappingURL=army.d.ts.map