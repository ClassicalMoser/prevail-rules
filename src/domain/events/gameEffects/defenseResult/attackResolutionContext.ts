/**
 * Ranged vs melee **attack-resolution** tagging (`'rangedAttack' | 'melee'`).
 *
 * Several effects must patch state under either command-resolution (ranged) or melee
 * attack-apply. The procedure already knows which path is active; carrying that on the event
 * keeps `applyEffects` handlers from re-branching on phase
 * or probing players.
 *
 * **Not** used for rout sources that are neither path (see `resolveRout.ts`: rally, rear
 * engagement). **Naming**: some events use `retreatResolutionContext` for the same two literals
 * when the semantic is “where the retreat substep lives”, not “generic attack context”.
 *
 * Tuple-typed exports use explicit `readonly [...]` annotations for `--isolatedDeclarations`.
 */
import { z } from "zod";

/**
 * Ranged command resolution: single defender, `attackApplyState` on command resolution state.
 */
export const RANGED_ATTACK_RESOLUTION_CONTEXT = "rangedAttack" as const;

/**
 * Melee phase: two-sided attack-apply; subtree is keyed by defending player / initiative order.
 */
export const MELEE_ATTACK_RESOLUTION_CONTEXT = "melee" as const;

/** `'rangedAttack' | 'melee'` — see named constants below. */
export type AttackResolutionContext =
  | typeof RANGED_ATTACK_RESOLUTION_CONTEXT
  | typeof MELEE_ATTACK_RESOLUTION_CONTEXT;

/**
 * Values for `z.enum` / iteration. Order matches {@link RANGED_ATTACK_RESOLUTION_CONTEXT} then
 * {@link MELEE_ATTACK_RESOLUTION_CONTEXT}.
 */
export const ATTACK_RESOLUTION_CONTEXT_VALUES: readonly [
  typeof RANGED_ATTACK_RESOLUTION_CONTEXT,
  typeof MELEE_ATTACK_RESOLUTION_CONTEXT,
] = [RANGED_ATTACK_RESOLUTION_CONTEXT, MELEE_ATTACK_RESOLUTION_CONTEXT];

const _attackResolutionContextSchemaObject: z.ZodType<AttackResolutionContext> = z.enum(
  ATTACK_RESOLUTION_CONTEXT_VALUES,
);

/** Zod schema for {@link AttackResolutionContext} (shared by reverse, rout union branch, etc.). */
export const attackResolutionContextSchema: typeof _attackResolutionContextSchemaObject =
  _attackResolutionContextSchemaObject;
