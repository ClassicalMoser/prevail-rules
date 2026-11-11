/**
 * Ranged vs melee **attack-resolution** tagging (`'rangedAttack' | 'melee'`).
 *
 * The `open*FromAttackApply` events still name which attack's apply they open, and in a melee
 * whose, because which apply opens next is the sequencer's rule and no query states it yet.
 * Effects whose target the state already names (`triggerRoutFromRetreat`, `completeAttackApply`,
 * `resolveReverse`) carry no context: their applies ask the state.
 */
/**
 * Ranged command resolution: single defender, `attackApplyState` on command resolution state.
 */
export const RANGED_ATTACK_RESOLUTION_CONTEXT = 'rangedAttack' as const;

/**
 * Melee phase: two-sided attack-apply; subtree is keyed by defending player / initiative order.
 */
export const MELEE_ATTACK_RESOLUTION_CONTEXT = 'melee' as const;

/** `'rangedAttack' | 'melee'` — see named constants below. */
export type AttackResolutionContext =
  | typeof RANGED_ATTACK_RESOLUTION_CONTEXT
  | typeof MELEE_ATTACK_RESOLUTION_CONTEXT;
