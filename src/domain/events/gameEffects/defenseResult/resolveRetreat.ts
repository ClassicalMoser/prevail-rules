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
  /** The final position of the unit. */
  finalPosition: UnitWithPlacement;
  /** The steps and turns of the fall-back, for a client to show it (§9.1). */
  path: MoveDelta[];
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

const _resolveRetreatEventSchemaObject = z
  .object({
    effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
    eventNumber: z.number(),
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    finalPosition: unitWithPlacementSchema,
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
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  finalPosition: typeof unitWithPlacementSchema;
  path: z.ZodArray<typeof moveDeltaSchema>;
  startingPosition: typeof unitWithPlacementSchema;
}> = _resolveRetreatEventSchemaObject;
