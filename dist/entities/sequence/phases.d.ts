import { z } from "zod";
/**
 * List of valid phases for a round.
 */
export declare const phases: readonly ["cards", "commanders", "ranged", "movement", "melee", "cleanup"];
/**
 * The schema for a phase of a round.
 */
export declare const phaseSchema: z.ZodEnum<["cards", "commanders", "ranged", "movement", "melee", "cleanup"]>;
/**
 * The type of a phase of a round.
 */
export type Phase = (typeof phases)[number];
//# sourceMappingURL=phases.d.ts.map