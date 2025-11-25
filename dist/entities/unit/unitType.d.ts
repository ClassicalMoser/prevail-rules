import { z } from "zod";
/**
 * The schema for a unit of troops.
 */
export declare const unitTypeSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    traits: z.ZodArray<z.ZodString, "many">;
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
  },
  "strip",
  z.ZodTypeAny,
  {
    reverse: number;
    id: string;
    name: string;
    traits: string[];
    attack: number;
    range: number;
    speed: number;
    flexibility: number;
    retreat: number;
    rout: number;
    cost: number;
    limit: number;
    routPenalty: number;
  },
  {
    reverse: number;
    id: string;
    name: string;
    traits: string[];
    attack: number;
    range: number;
    speed: number;
    flexibility: number;
    retreat: number;
    rout: number;
    cost: number;
    limit: number;
    routPenalty: number;
  }
>;
/**
 * A unit of troops.
 */
export interface UnitType {
  /** The unique identifier of the unit. */
  id: string;
  /** The capitalized name of the unit. */
  name: string;
  /** The traits of the unit. */
  traits: string[];
  /** The attack strength of the unit. */
  attack: number;
  /** The normal attack range of the unit. */
  range: number;
  /** The maximum movement speed of the unit. */
  speed: number;
  /** The flexibility value of the unit. */
  flexibility: number;
  /** The attack value required to reverse the unit. */
  reverse: number;
  /** The attack value required to retreat the unit. */
  retreat: number;
  /** The attack value required to rout the unit. */
  rout: number;
  /** The cost of the unit. */
  cost: number;
  /** The limit of units that can be included in a standard army. */
  limit: number;
  /** The number of cards the owner must discard when the unit is routed. */
  routPenalty: number;
}
//# sourceMappingURL=unitType.d.ts.map
