import { z } from "zod";
export declare const gameType: readonly ["standard", "mini", "tutorial"];
export declare const gameTypeSchema: z.ZodEnum<["standard", "mini", "tutorial"]>;
/**
 * A type of game.
 */
export type GameType = (typeof gameType)[number];
//# sourceMappingURL=gameType.d.ts.map