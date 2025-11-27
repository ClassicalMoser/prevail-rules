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
/**
 * Check that the army type matches the schema.
 */
const _assertExactArmy = true;
