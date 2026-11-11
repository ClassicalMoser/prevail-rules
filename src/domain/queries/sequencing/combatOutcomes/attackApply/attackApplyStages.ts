/**
 * The stages an attack's results are carried out in, in order (§7.5.2): the
 * unit falls back, then turns about, then leaves the field.
 *
 * A melee carries each stage out for both units before the next begins
 * (§7.5.6), so the stage is what the sequencer walks, not the unit.
 */
export const attackApplyStages: readonly ['retreat', 'reverse', 'rout'] = [
  'retreat',
  'reverse',
  'rout',
] as const;

/** One stage of carrying out an attack's results. */
export type AttackApplyStage = (typeof attackApplyStages)[number];
