import type { Card } from "./card.js";
import { z } from "zod";
/** The schema for a player's card state. */
export declare const playerCardStateSchema: z.ZodObject<{
    /** The cards in the player's hand, eligible to be played. */
    inHand: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    /** The facedown card that the player is currently playing. */
    awaitingPlay: z.ZodObject<{
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
    /** The faceup card that is in play.*/
    inPlay: z.ZodObject<{
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
    /** The cards that have been discarded and are not currently accessible to the player. */
    discarded: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    /** The cards that have been burnt and cannot be recovered. */
    burnt: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    inHand: {
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
    }[];
    awaitingPlay: {
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
    inPlay: {
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
    discarded: {
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
    }[];
    burnt: {
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
    }[];
}, {
    inHand: {
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
    }[];
    awaitingPlay: {
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
    inPlay: {
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
    discarded: {
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
    }[];
    burnt: {
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
    }[];
}>;
/** The state of a player's cards. */
export interface PlayerCardState {
    /** The cards in the player's hand, eligible to be played. */
    inHand: Card[];
    /** The facedown card that the player is currently playing. */
    awaitingPlay: Card;
    /** The faceup card that is in play.*/
    inPlay: Card;
    /** The cards that have been discarded and are not currently accessible to the player. */
    discarded: Card[];
    /** The cards that have been burnt and cannot be recovered. */
    burnt: Card[];
}
//# sourceMappingURL=playerCardState.d.ts.map