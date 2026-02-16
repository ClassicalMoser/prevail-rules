import type { Board, UnitInstance, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitInstanceSchema, unitPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve ranged attack game effect. */
export const RESOLVE_RANGED_ATTACK_EFFECT_TYPE = 'resolveRangedAttack' as const;

export interface ResolveRangedAttackEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveRangedAttack' = 'resolveRangedAttack',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE;
  /** The unit that is being attacked */
  unitInstance: UnitInstance;
  /** The current placement of the defending unit on the board. */
  unitPlacement: UnitPlacement<Board>;
  /** Whether the unit is routed. */
  routed: boolean;
  /** Whether the unit is reversed. */
  reversed: boolean;
  /** Whether the unit is retreated. */
  retreated: boolean;
  /** Legal retreat options for the defending unit (empty if not retreating). */
  legalRetreats: Set<UnitPlacement<Board>>;
}

const _resolveRangedAttackEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  /** The unit that is being attacked */
  unitInstance: unitInstanceSchema,
  /** The current placement of the defending unit on the board. */
  unitPlacement: unitPlacementSchema,
  /** Whether the unit is routed. */
  routed: z.boolean(),
  /** Whether the unit is reversed. */
  reversed: z.boolean(),
  /** Whether the unit is retreated. */
  retreated: z.boolean(),
  /** Legal retreat options for the defending unit (empty if not retreating). */
  legalRetreats: z.set(unitPlacementSchema),
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
  unitInstance: typeof unitInstanceSchema;
  unitPlacement: typeof unitPlacementSchema;
  routed: z.ZodBoolean;
  reversed: z.ZodBoolean;
  retreated: z.ZodBoolean;
  legalRetreats: z.ZodSet<typeof unitPlacementSchema>;
}> = _resolveRangedAttackEventSchemaObject;
