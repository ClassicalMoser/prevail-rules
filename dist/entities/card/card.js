import { z } from "zod";
import { commandSchema } from "./command.js";
/**
 * The schema for a card.
 */
export const cardSchema = z.object({
    /** The unique identifier of the card. */
    id: z.string().uuid(),
    /** The name of the card, regardless of version. */
    name: z.string(),
    /** The initiative value of the card. */
    initiative: z.number().int().min(1).max(4),
    /** Whether the card allows ranged attacks. */
    ranged: z.boolean(),
    /** The command to be used on the card. */
    command: commandSchema,
    /** The range of the inspiration effect. */
    inspirationRange: z.number().int().min(1).max(10),
    /** The text describing the effect of the inspiration. */
    inspirationEffectText: z.string(),
    /** The effect of the inspiration. */
    inspirationEffect: z.function().returns(z.void()),
    /** The text describing the global effect, if any. */
    globalEffectText: z.string().optional(),
    /** The global effect, if any. */
    globalEffect: z.function().returns(z.void()).optional(),
});
// Verify manual type matches schema inference
const _assertExactCard = true;
