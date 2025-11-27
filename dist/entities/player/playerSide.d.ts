import { z } from "zod";
export declare const playerSide: readonly ["black", "white"];
/** The schema for a player's side. */
export declare const playerSideSchema: z.ZodEnum<["black", "white"]>;
/** The side of a player. */
export type PlayerSide = (typeof playerSide)[number];
//# sourceMappingURL=playerSide.d.ts.map