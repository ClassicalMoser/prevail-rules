import type { MoveDelta, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve retreat game effect. */
export const RESOLVE_RETREAT_EFFECT_TYPE = 'resolveRetreat' as const;

export interface ResolveRetreatEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RETREAT_EFFECT_TYPE;
  /** The starting position of the unit. */
  startingPosition: UnitWithPlacement;
  /**
   * The steps and turns of the fall-back (§9.1). Where the unit ends is read
   * from this path and its starting position, never stored beside them.
   */
  path: MoveDelta[];
}

const _resolveRetreatEventSchemaObject = z
  .object({
    effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    path: z.array(moveDeltaSchema),
    startingPosition: unitWithPlacementSchema,
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
  startingPosition: typeof unitWithPlacementSchema;
}> = _resolveRetreatEventSchemaObject;
