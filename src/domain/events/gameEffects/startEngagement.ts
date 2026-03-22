import type { Board, EngagementType, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { engagementTypeSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the start engagement game effect. */
export const START_ENGAGEMENT_EFFECT_TYPE = 'startEngagement' as const;

/**
 * Starts engagement resolution when a unit moves onto an enemy.
 *
 * **Payload**: `defenderWithPlacement` is the engaged enemy at the movement target—**unit plus
 * coordinate and facing** from the procedure’s board read (same pattern as
 * `ResolveRangedAttackEvent.defenderWithPlacement`). Apply does not scan the target space or
 * call `getPositionOfUnit`; replay carries enough to locate the defender without a board lookup.
 */
export interface StartEngagementEvent<
  _TBoard extends Board,
  _TEffectType extends 'startEngagement' = 'startEngagement',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof START_ENGAGEMENT_EFFECT_TYPE;
  /** The type of engagement. */
  engagementType: EngagementType;
  /** Engaged enemy: instance and placement at the movement target (procedure snapshot). */
  defenderWithPlacement: UnitWithPlacement<Board>;
}

const _startEngagementEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  /** The type of engagement. */
  engagementType: engagementTypeSchema,
  /** Engaged enemy: instance and placement at the movement target (procedure snapshot). */
  defenderWithPlacement: unitWithPlacementSchema,
});

type StartEngagementEventSchemaType = z.infer<
  typeof _startEngagementEventSchemaObject
>;

const _assertExactStartEngagementEvent: AssertExact<
  StartEngagementEvent<Board>,
  StartEngagementEventSchemaType
> = true;

/** The schema for a start engagement event. */
export const startEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'startEngagement'>;
  engagementType: typeof engagementTypeSchema;
  defenderWithPlacement: typeof unitWithPlacementSchema;
}> = _startEngagementEventSchemaObject;
