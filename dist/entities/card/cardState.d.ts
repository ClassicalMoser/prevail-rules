import type { PlayerCardState } from "./playerCardState.js";
import { z } from "zod";
/** The schema for the state of all cards in the game. */
export declare const cardStateSchema: z.ZodObject<{
    /** The state of the cards for the black player. */
    blackPlayer: z.ZodObject<{
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
    /** The state of the cards for the white player. */
    whitePlayer: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    blackPlayer: {
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
    };
    whitePlayer: {
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
    };
}, {
    blackPlayer: {
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
    };
    whitePlayer: {
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
    };
}>;
/** The state of all cards in the game. */
export interface CardState {
    /** The state of the cards for the black player. */
    blackPlayer: PlayerCardState;
    /** The state of the cards for the white player. */
    whitePlayer: PlayerCardState;
}
//# sourceMappingURL=cardState.d.ts.map