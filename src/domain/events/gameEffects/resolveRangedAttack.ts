import type { Board } from '@entities';
import type { UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { unitInstanceSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { RESOLVE_RANGED_ATTACK_EFFECT_TYPE } from './gameEffect';

export interface ResolveRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE;
  /** The unit that is being attacked */
  unitInstance: UnitInstance;
  /** Whether the unit is routed. */
  routed: boolean;
  /** Whether the unit is reversed. */
  reversed: boolean;
  /** Whether the unit is retreated. */
  retreated: boolean;
}

const _resolveRangedAttackEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  /** The unit that is being attacked */
  unitInstance: unitInstanceSchema,
  /** Whether the unit is routed. */
  routed: z.boolean(),
  /** Whether the unit is reversed. */
  reversed: z.boolean(),
  /** Whether the unit is retreated. */
  retreated: z.boolean(),
});

type ResolveRangedAttackEventSchemaType = z.infer<
  typeof _resolveRangedAttackEventSchemaObject
>;

const _assertExactResolveRangedAttackEvent: AssertExact<
  ResolveRangedAttackEvent,
  ResolveRangedAttackEventSchemaType
> = true;

/** The schema for a resolve ranged attack event. */
export const resolveRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE>;
  unitInstance: typeof unitInstanceSchema;
  routed: z.ZodBoolean;
  reversed: z.ZodBoolean;
  retreated: z.ZodBoolean;
}> = _resolveRangedAttackEventSchemaObject;
