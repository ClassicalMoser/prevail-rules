import type { Card, UnitCount } from "@entities";
import type { AssertExact } from "@utils";
import { unitCountSchema } from "@entities/army/unitCount";
import { cardSchema } from "@entities/card/card";
import { z } from "zod";

/**
 * The schema for an army of troops.
 */
export const armySchema = z.object({
  /** The unique identifier of the army. */
  id: z.string().uuid(),
  /** The units in the army. */
  units: z.set(unitCountSchema),
  /** The command cards in the army. */
  commandCards: z.set(cardSchema),
});

// Helper type to check match of type against schema
type ArmySchemaType = z.infer<typeof armySchema>;

/**
 * An army of troops.
 */
export interface Army {
  /** The unique identifier of the army. */
  id: string;
  /** The units in the army. */
  units: Set<UnitCount>;
  /** The command cards in the army. */
  commandCards: Set<Card>;
}

/**
 * Check that the army type matches the schema.
 */
const _assertExactArmy: AssertExact<Army, ArmySchemaType> = true;
