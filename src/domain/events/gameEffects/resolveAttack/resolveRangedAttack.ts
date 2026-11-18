import type { AttackResult } from '@entities';
import type { AssertExact } from '@utils';
import { attackResultSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the resolve ranged attack game effect. */
export const RESOLVE_RANGED_ATTACK_EFFECT_TYPE = 'resolveRangedAttack' as const;

/**
 * A shot is measured against its target (§4.3.11): which of the target's
 * thresholds it reached. The target is the one the shot was aimed at, which the
 * state holds, so the event carries only the result.
 *
 * `generateResolveRangedAttackEvent` writes it, and `applyResolveRangedAttackEvent` applies it.
 */
export interface ResolveRangedAttackEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE;
  /** What the shot reached against the target's thresholds. */
  attackResult: AttackResult;
}

const _resolveRangedAttackEventSchemaObject = z
  .object({
    /** What the shot reached against the target's thresholds. */
    attackResult: attackResultSchema,
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  })
  .strict();

type ResolveRangedAttackEventSchemaType = z.infer<
  typeof _resolveRangedAttackEventSchemaObject
>;

const _assertExactResolveRangedAttackEvent: AssertExact<
  ResolveRangedAttackEvent,
  ResolveRangedAttackEventSchemaType
> = true;

/** The schema for a resolve ranged attack event. */
export const resolveRangedAttackEventSchema: z.ZodObject<{
  attackResult: typeof attackResultSchema;
  effectType: z.ZodLiteral<typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
}> = _resolveRangedAttackEventSchemaObject;
