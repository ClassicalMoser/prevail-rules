import type { Board, UnitPlacement, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitPlacementSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve ranged attack game effect. */
export const RESOLVE_RANGED_ATTACK_EFFECT_TYPE = 'resolveRangedAttack' as const;

/**
 * Ranged attack resolution: attack value applied, then routed / reversed / retreated flags drive
 * substeps.
 *
 * **Payload notes**: `defenderWithPlacement` is the target unit snapshot; `legalRetreatOptions`
 * is filled by the procedure when `retreated` (else empty) so apply does not call
 * `getLegalRetreats` or hunt the defender on the board.
 */
export interface ResolveRangedAttackEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveRangedAttack' = 'resolveRangedAttack',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE;
  /** Defending unit and board position (procedure snapshot for apply). */
  defenderWithPlacement: UnitWithPlacement<Board>;
  /**
   * Legal retreats when `retreated`; otherwise empty.
   * Filled by the procedure; apply does not call `getLegalRetreats`.
   */
  legalRetreatOptions: Set<UnitPlacement<Board>>;
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
  /** Defending unit and board position (procedure snapshot for apply). */
  defenderWithPlacement: unitWithPlacementSchema,
  /**
   * Legal retreats when `retreated`; otherwise empty.
   * Filled by the procedure; apply does not call `getLegalRetreats`.
   */
  legalRetreatOptions: z.set(unitPlacementSchema),
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
  ResolveRangedAttackEvent<Board>,
  ResolveRangedAttackEventSchemaType
> = true;

/** The schema for a resolve ranged attack event. */
export const resolveRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveRangedAttack'>;
  defenderWithPlacement: typeof unitWithPlacementSchema;
  legalRetreatOptions: z.ZodSet<typeof unitPlacementSchema>;
  routed: z.ZodBoolean;
  reversed: z.ZodBoolean;
  retreated: z.ZodBoolean;
}> = _resolveRangedAttackEventSchemaObject;
