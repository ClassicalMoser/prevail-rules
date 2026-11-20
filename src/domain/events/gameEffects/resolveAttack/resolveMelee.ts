import type { AttackResult } from '@entities';
import type { AssertExact } from '@utils';
import { attackResultSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the resolve melee game effect. */
export const RESOLVE_MELEE_EFFECT_TYPE = 'resolveMelee' as const;

/**
 * A melee is fought: each unit's attack value is measured against the other
 * unit's thresholds (§7.2.2).
 *
 * Both units attack at once (§7.2.1); the event records what each reached against
 * the unit it struck, by that unit's colour. The two units are the ones engaged
 * in the melee's space, which the state holds, so the event carries only the
 * results. The retreats a result calls for are not recorded here: each is worked
 * out when that retreat opens, from the board as it then stands, since an
 * earlier stage may have moved units (§7.5.6).
 *
 * `generateResolveMeleeEvent` writes it, and `applyResolveMeleeEvent` applies it.
 */
export interface ResolveMeleeEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof RESOLVE_MELEE_EFFECT_TYPE;
  /** What Black's attack reached against White's unit. */
  attackResultOnWhiteUnit: AttackResult;
  /** What White's attack reached against Black's unit. */
  attackResultOnBlackUnit: AttackResult;
}

const _resolveMeleeEventSchemaObject = z
  .object({
    /** What White's attack reached against Black's unit. */
    attackResultOnBlackUnit: attackResultSchema,
    /** What Black's attack reached against White's unit. */
    attackResultOnWhiteUnit: attackResultSchema,
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(RESOLVE_MELEE_EFFECT_TYPE),
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
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
  attackResultOnBlackUnit: typeof attackResultSchema;
  attackResultOnWhiteUnit: typeof attackResultSchema;
  effectType: z.ZodLiteral<typeof RESOLVE_MELEE_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
}> = _resolveMeleeEventSchemaObject;
