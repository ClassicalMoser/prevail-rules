import type { Army } from "./army/army.js";
import type { GameType } from "./gameType.js";
import { z } from "zod";
/**
 * The schema for a complete game of Prevail: Ancient Battles.
 */
export declare const gameSchema: z.ZodObject<{
    /** The unique identifier of the game. */
    id: z.ZodString;
    /** The type of game. */
    gameType: z.ZodEnum<["standard", "mini", "tutorial"]>;
    /** The unique identifier of the player on the black side of the game. */
    blackPlayer: z.ZodString;
    /** The unique identifier of the player on the white side of the game. */
    whitePlayer: z.ZodString;
    /** The army brought by the black player. */
    blackArmy: z.ZodObject<{
        id: z.ZodString;
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
    /** The army brought by the white player. */
    whiteArmy: z.ZodObject<{
        id: z.ZodString;
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
}, "strip", z.ZodTypeAny, {
    id: string;
    gameType: "standard" | "mini" | "tutorial";
    blackPlayer: string;
    whitePlayer: string;
    blackArmy: {
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
    };
    whiteArmy: {
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
    };
}, {
    id: string;
    gameType: "standard" | "mini" | "tutorial";
    blackPlayer: string;
    whitePlayer: string;
    blackArmy: {
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
    };
    whiteArmy: {
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
    };
}>;
/**
 * A complete game of Prevail: Ancient Battles.
 */
export interface Game {
    /** The unique identifier of the game. */
    id: string;
    /** The type of game. */
    gameType: GameType;
    /** The unique identifier of the player on the black side of the game. */
    blackPlayer: string;
    /** The unique identifier of the player on the white side of the game. */
    whitePlayer: string;
    /** The army brought by the black player. */
    blackArmy: Army;
    /** The army brought by the white player. */
    whiteArmy: Army;
}
//# sourceMappingURL=game.d.ts.map