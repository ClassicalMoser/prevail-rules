import { z } from 'zod';

/**
 * Every kind of substep play can be inside. Three belong to a phase: carrying
 * out an order (Issue Commands), resolving a melee (Resolve Melee) and
 * resolving a rally (Cleanup). An engagement opens inside a Move order. The
 * last four are what an attack, an engagement or a rally can end in: an
 * attack's results applied, and a unit reversed, retreated or routed.
 */
export const substepTypes = [
  'commandResolution',
  'meleeResolution',
  'rallyResolution',
  'engagementResolution',
  'attackApply',
  'reverse',
  'retreat',
  'rout',
] as const;

/** The kind of substep play is inside. */
export type SubstepType = (typeof substepTypes)[number];

/** An order being carried out, by Move or by Shoot. */
export const COMMAND_RESOLUTION_SUBSTEP_TYPE: 'commandResolution' =
  substepTypes[0];

/** A melee being resolved in one space. */
export const MELEE_RESOLUTION_SUBSTEP_TYPE: 'meleeResolution' = substepTypes[1];

/** A player's rally being resolved. */
export const RALLY_RESOLUTION_SUBSTEP_TYPE: 'rallyResolution' = substepTypes[2];

/** An engagement a moving unit has started. */
export const ENGAGEMENT_RESOLUTION_SUBSTEP_TYPE: 'engagementResolution' =
  substepTypes[3];

/** An attack's results being applied to the unit it struck. */
export const ATTACK_APPLY_SUBSTEP_TYPE: 'attackApply' = substepTypes[4];

/** A unit turning to face its attacker. */
export const REVERSE_SUBSTEP_TYPE: 'reverse' = substepTypes[5];

/** A unit falling back. */
export const RETREAT_SUBSTEP_TYPE: 'retreat' = substepTypes[6];

/** Units routed, and the cards their player owes for them. */
export const ROUT_SUBSTEP_TYPE: 'rout' = substepTypes[7];

/** The schema for the kind of substep play is inside. */
export const substepTypeSchema: z.ZodType<SubstepType> = z.enum(substepTypes);
