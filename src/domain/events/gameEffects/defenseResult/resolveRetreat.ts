import type { MoveDelta, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema, unitInstanceSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve retreat game effect. */
export const RESOLVE_RETREAT_EFFECT_TYPE = 'resolveRetreat' as const;

export interface ResolveRetreatEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RETREAT_EFFECT_TYPE;
  /** The unit falling back, by identity; where it stands is the board's. */
  unit: UnitInstance;
  /**
   * The steps and turns of the fall-back (§9.1). Where the unit ends is read
   * from this path and where it stands, never stored beside them.
   */
  path: MoveDelta[];
}

const _resolveRetreatEventSchemaObject = z
  .object({
    effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    path: z.array(moveDeltaSchema),
    unit: unitInstanceSchema,
  })
  .strict();

type ResolveRetreatEventSchemaType = z.infer<
  typeof _resolveRetreatEventSchemaObject
>;

const _assertExactResolveRetreatEvent: AssertExact<
  ResolveRetreatEvent,
  ResolveRetreatEventSchemaType
> = true;

/** The schema for a resolve retreat event. */
export const resolveRetreatEventSchema: z.ZodObject<{
  effectType: z.ZodLiteral<typeof RESOLVE_RETREAT_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  path: z.ZodArray<typeof moveDeltaSchema>;
  unit: typeof unitInstanceSchema;
}> = _resolveRetreatEventSchemaObject;
