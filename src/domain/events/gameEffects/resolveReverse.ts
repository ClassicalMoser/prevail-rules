import type { Board, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { RESOLVE_REVERSE_EFFECT_TYPE } from './gameEffect';

/** An event to resolve a reverse.
 * A unit that is reversed changes its facing to the opposite
 * of its current facing.
 */
export interface ResolveReverseEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_REVERSE_EFFECT_TYPE;
  /** The unit that is being reversed. */
  unitInstance: UnitWithPlacement<Board>;
  /** The new unit placement after the reverse. */
  newUnitPlacement: UnitWithPlacement<Board>;
}

const _resolveReverseEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  /** The unit that is being reversed. */
  unitInstance: unitWithPlacementSchema,
  /** The new unit placement after the reverse. */
  newUnitPlacement: unitWithPlacementSchema,
});

type ResolveReverseEventSchemaType = z.infer<
  typeof _resolveReverseEventSchemaObject
>;

const _assertExactResolveReverseEvent: AssertExact<
  ResolveReverseEvent,
  ResolveReverseEventSchemaType
> = true;

/** The schema for a resolve reverse event. */
export const resolveReverseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_REVERSE_EFFECT_TYPE>;
  unitInstance: typeof unitWithPlacementSchema;
  newUnitPlacement: typeof unitWithPlacementSchema;
}> = _resolveReverseEventSchemaObject;
