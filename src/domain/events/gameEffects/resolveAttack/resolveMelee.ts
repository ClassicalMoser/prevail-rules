import type { AttackResult } from '@entities';
import type { AssertExact } from '@utils';
import { attackResultSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve melee game effect. */
export const RESOLVE_MELEE_EFFECT_TYPE = 'resolveMelee' as const;

/**
 * Deterministic melee resolution after engagement, supports, and committed cards.
 * Both blows land at once (§7.1); the event records what each reached against
 * the unit it struck, by that unit's colour. The two units are the ones engaged
 * in the melee's space, which the state holds, so the event carries only the
 * results. The retreats a result calls for are not recorded here: each is worked
 * out when that retreat opens, from the board as it then stands, since an
 * earlier stage may have moved units (§7.5.6).
 *
 * TODO(misleading): §7.1 is how an attack value is made; that both units
 * strike at once is §7.2.1. Settled by correcting the reference.
 */
export interface ResolveMeleeEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_MELEE_EFFECT_TYPE;
  /** What Black's blow reached against White's unit. */
  whiteAttackResult: AttackResult;
  /** What White's blow reached against Black's unit. */
  blackAttackResult: AttackResult;
}

const _resolveMeleeEventSchemaObject = z
  .object({
    /** What White's blow reached against Black's unit. */
    blackAttackResult: attackResultSchema,
    /** The type of game effect. */
    effectType: z.literal(RESOLVE_MELEE_EFFECT_TYPE),
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** What Black's blow reached against White's unit. */
    whiteAttackResult: attackResultSchema,
  })
  .strict();

type ResolveMeleeEventSchemaType = z.infer<
  typeof _resolveMeleeEventSchemaObject
>;

const _assertExactResolveMeleeEvent: AssertExact<
  ResolveMeleeEvent,
  ResolveMeleeEventSchemaType
> = true;

/** The schema for a resolve melee event. */
export const resolveMeleeEventSchema: z.ZodObject<{
  blackAttackResult: typeof attackResultSchema;
  effectType: z.ZodLiteral<typeof RESOLVE_MELEE_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  whiteAttackResult: typeof attackResultSchema;
}> = _resolveMeleeEventSchemaObject;
