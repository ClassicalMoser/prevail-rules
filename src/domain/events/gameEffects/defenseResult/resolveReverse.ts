import type { UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve reverse game effect. */
export const RESOLVE_REVERSE_EFFECT_TYPE = 'resolveReverse' as const;

/**
 * Turns a reversed unit about (§9.2). The event names the unit, and its owner names the
 * reverse: which attack's apply holds it is the state's to say.
 */
export interface ResolveReverseEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_REVERSE_EFFECT_TYPE;
  /** The unit instance that is being reversed. */
  unitInstance: UnitWithPlacement;
  /** The new unit placement after the reverse. */
  newUnitPlacement: UnitWithPlacement;
}

const _resolveReverseEventSchemaObject = z
  .object({
    effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    newUnitPlacement: unitWithPlacementSchema,
    unitInstance: unitWithPlacementSchema,
  })
  .strict();

type ResolveReverseEventSchemaType = z.infer<
  typeof _resolveReverseEventSchemaObject
>;

const _assertExactResolveReverseEvent: AssertExact<
  ResolveReverseEvent,
  ResolveReverseEventSchemaType
> = true;

/** The schema for a resolve reverse event. */
export const resolveReverseEventSchema: z.ZodObject<{
  effectType: z.ZodLiteral<typeof RESOLVE_REVERSE_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  newUnitPlacement: typeof unitWithPlacementSchema;
  unitInstance: typeof unitWithPlacementSchema;
}> = _resolveReverseEventSchemaObject;
