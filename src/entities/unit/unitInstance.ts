import type { AssertExact } from "../../utils/assertExact.js";
import type { PlayerSide } from "../player/playerSide.js";
import type { UnitType } from "./unitType.js";
import { z } from "zod";
import { playerSideSchema } from "../player/playerSide.js";
import { unitTypeSchema } from "./unitType.js";

/**
 * The schema for a unit instance.
 */
export const unitInstanceSchema = z.object({
  /** Which player the unit belongs to. */
  playerSide: playerSideSchema,
  /** The type of unit this is an instance of. */
  unitType: unitTypeSchema,
  /** Which instance of the unit this is. */
  instanceNumber: z.number().min(1).max(20),
});

// Helper type to check match of type against schema
type UnitInstanceSchemaType = z.infer<typeof unitInstanceSchema>;

/**
 * An individual instance of a unit.
 */
export interface UnitInstance {
  /** Which player the unit belongs to. */
  playerSide: PlayerSide;
  /** The type of unit this is an instance of. */
  unitType: UnitType;
  /** Which instance of the unit this is. */
  instanceNumber: number;
}

const _assertExactUnitInstance: AssertExact<
  UnitInstance,
  UnitInstanceSchemaType
> = true;
