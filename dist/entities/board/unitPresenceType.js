import { z } from "zod";
/**
 * List of valid unit presence types.
 */
export const unitPresenceType = ["none", "single", "engaged"];
/**
 * The schema for the type of unit presence in a space.
 */
export const unitPresenceTypeSchema = z.enum(unitPresenceType);
const _assertExactUnitPresenceType = true;
