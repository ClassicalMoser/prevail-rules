import type { Board, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';

import { unitWithPlacementSchema } from '@entities';
import { z } from 'zod';

/** An event to resolve a retreat.
 * A retreat is a unit's smallest legal backward movement.
 * If there are multiple legal retreats, the player must choose one.
 * If there is no legal retreat, the unit is routed.
 */
export interface ResolveRetreatEvent {
  /** The type of the event. */
  eventType: 'gameEffect';
  startingPosition: UnitWithPlacement<Board>;
  endingPositionOptions: Set<UnitWithPlacement<Board>>;
  unitRouted: boolean;
}

const _resolveRetreatEventSchemaObject = z.object({
  eventType: z.literal('gameEffect' as const),
  startingPosition: unitWithPlacementSchema,
  endingPositionOptions: z.set(unitWithPlacementSchema),
  unitRouted: z.boolean(),
});

type ResolveRetreatEventSchemaType = z.infer<
  typeof _resolveRetreatEventSchemaObject
>;

const _assertExactResolveRetreatEvent: AssertExact<
  ResolveRetreatEvent,
  ResolveRetreatEventSchemaType
> = true;

/** The schema for a resolve retreat event. */
export const resolveRetreatEventSchema: z.ZodType<ResolveRetreatEvent> =
  _resolveRetreatEventSchemaObject;
