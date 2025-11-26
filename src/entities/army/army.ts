import type { AssertExact } from "../../utils/assertExact.js";
import type { Card } from "../card/card.js";
import type { UnitCount } from "./unitCount.js";
import { z } from "zod";
import { cardSchema } from "../card/card.js";
import { unitCountSchema } from "./unitCount.js";

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
