/**
 * Each list names stat modifiers; where a list is used, `StatModifier` checks
 * the names, since this layer does not import the domain.
 *
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
