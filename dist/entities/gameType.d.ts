import type { BoardSize } from "./board/board.js";
import { z } from "zod";
export declare const gameType: readonly ["standard", "mini", "tutorial"];
export declare const gameTypeEnum: z.ZodEnum<["standard", "mini", "tutorial"]>;
/**
 * A type of game.
 */
export type GameType = (typeof gameType)[number];
export declare const gameTypeStructureSchema: z.ZodObject<{
    type: z.ZodEnum<["standard", "mini", "tutorial"]>;
    boardSize: z.ZodEnum<["standard", "small", "large"]>;
}, "strip", z.ZodTypeAny, {
    type: "standard" | "mini" | "tutorial";
    boardSize: "small" | "large" | "standard";
}, {
    type: "standard" | "mini" | "tutorial";
    boardSize: "small" | "large" | "standard";
}>;
/**
 * The structure of a game type.
 */
export interface GameTypeStructure {
    type: GameType;
    boardSize: BoardSize;
}
//# sourceMappingURL=gameType.d.ts.map