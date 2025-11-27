import { z } from "zod";
/**
 * List of valid phases for a round.
 */
export const phases = [
    "cards",
    "commanders",
    "ranged",
    "movement",
    "melee",
    "cleanup",
];
/**
 * The schema for a phase of a round.
 */
export const phaseSchema = z.enum(phases);
const _assertExactPhase = true;
