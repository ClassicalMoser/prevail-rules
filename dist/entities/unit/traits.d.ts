import { z } from "zod";
export declare const traits: readonly ["formation", "sword", "spear", "phalanx", "skirmish", "javelin", "mounted", "horse"];
export declare const traitSchema: z.ZodEnum<["formation", "sword", "spear", "phalanx", "skirmish", "javelin", "mounted", "horse"]>;
/**
 * A trait of a unit.
 */
export type Trait = (typeof traits)[number];
//# sourceMappingURL=traits.d.ts.map