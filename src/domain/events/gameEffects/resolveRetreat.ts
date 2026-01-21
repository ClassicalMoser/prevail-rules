import type { Board, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';

import { unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve retreat game effect. */
export const RESOLVE_RETREAT_EFFECT_TYPE = 'resolveRetreat' as const;

/** An event to resolve a retreat.
 * A retreat is a unit's smallest legal backward movement.
 * If there are multiple legal retreats, the player must choose one.
 * If there is no legal retreat, the unit is routed.
 */
export interface ResolveRetreatEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveRetreat' = 'resolveRetreat',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RETREAT_EFFECT_TYPE;
  /** The starting position of the unit. */
  startingPosition: UnitWithPlacement<Board>;
  /** The ending position options for the unit. */
  endingPositionOptions: Set<UnitWithPlacement<Board>>;
  /** Whether the unit is routed. */
  unitRouted: boolean;
}

const _resolveRetreatEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
  /** The starting position of the unit. */
  startingPosition: unitWithPlacementSchema,
  /** The ending position options for the unit. */
  endingPositionOptions: z.set(unitWithPlacementSchema),
  /** Whether the unit is routed. */
  unitRouted: z.boolean(),
});

type ResolveRetreatEventSchemaType = z.infer<
  typeof _resolveRetreatEventSchemaObject
>;

const _assertExactResolveRetreatEvent: AssertExact<
  ResolveRetreatEvent<Board>,
  ResolveRetreatEventSchemaType
> = true;

/** The schema for a resolve retreat event. */
export const resolveRetreatEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRetreat'>;
  startingPosition: typeof unitWithPlacementSchema;
  endingPositionOptions: z.ZodSet<typeof unitWithPlacementSchema>;
  unitRouted: z.ZodBoolean;
}> = _resolveRetreatEventSchemaObject;
