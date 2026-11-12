import { z } from 'zod';

/**
 * The stats a card committed to a melee may apply (§8.4): Attack, which hits
 * harder; Defence, which raises its own unit's thresholds for this fight
 * (§8.5); and Flexibility.
 */
export const MELEE_COMMITMENT_MODIFIERS: readonly (
  | 'attack'
  | 'defense'
  | 'flexibility'
)[] = ['attack', 'defense', 'flexibility'];

/**
 * The stats a mover's or a front-engaged defender's commitment may apply
 * (§8.4): Speed, and Flexibility.
 */
export const MOVEMENT_COMMITMENT_MODIFIERS: readonly (
  | 'speed'
  | 'flexibility'
)[] = ['speed', 'flexibility'];

/**
 * The stats a shooter's card may be committed for (§8.4): Range, which
 * reaches one space further out when the target is chosen (§4.3.11); Attack,
 * which hits harder; and Flexibility, which will shrink a shooter's terrain
 * deficit once terrain lands (§2.5.2) and adds nothing until then. Defence is
 * not here: it belongs to the target, which commits on its own.
 */
export const RANGED_ATTACK_COMMITMENT_MODIFIERS: readonly (
  | 'range'
  | 'attack'
  | 'flexibility'
)[] = ['range', 'attack', 'flexibility'];

/**
 * The stats a shot's target may commit a card for (§8.4): Defence, which
 * raises all three of its thresholds against this shot (§8.5); and
 * Flexibility, which shrinks a terrain deficit, and with it the penalty a
 * deficit puts on those same thresholds (§2.5.2). Flexibility adds nothing
 * until terrain lands. Range and Attack are not here: they belong to the
 * shooter, which commits on its own.
 */
export const RANGED_DEFENSE_COMMITMENT_MODIFIERS: readonly (
  | 'defense'
  | 'flexibility'
)[] = ['defense', 'flexibility'];

/**
 * Every stat a card may name as a modifier: each one that some moment of
 * commitment accepts, and no other (§8.4). These are the unit stats, except
 * that the three thresholds (Retreat, Reverse and Rout) are named together as
 * Defence, which raises all three at once (§8.5).
 */
export type StatModifier =
  | (typeof MELEE_COMMITMENT_MODIFIERS)[number]
  | (typeof MOVEMENT_COMMITMENT_MODIFIERS)[number]
  | (typeof RANGED_ATTACK_COMMITMENT_MODIFIERS)[number]
  | (typeof RANGED_DEFENSE_COMMITMENT_MODIFIERS)[number];

/** Every stat a card may name, each once, gathered from the moments above. */
export const statModifiers: readonly StatModifier[] = [
  ...new Set<StatModifier>([
    ...MELEE_COMMITMENT_MODIFIERS,
    ...MOVEMENT_COMMITMENT_MODIFIERS,
    ...RANGED_ATTACK_COMMITMENT_MODIFIERS,
    ...RANGED_DEFENSE_COMMITMENT_MODIFIERS,
  ]),
];

/**
 * Schema for a stat a card may name. Both sides come from the commitment
 * lists, so no separate AssertExact drift check is needed.
 */
export const statModifierSchema: z.ZodType<StatModifier> =
  z.enum(statModifiers);
