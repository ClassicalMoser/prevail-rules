import type { UnitPlacement, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitPlacementSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve ranged attack game effect. */
export const RESOLVE_RANGED_ATTACK_EFFECT_TYPE = 'resolveRangedAttack' as const;

export interface ResolveRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE;
  /** Whether the unit is routed. */
  routed: boolean;
  /** Whether the unit is reversed. */
  reversed: boolean;
  /** Whether the unit is retreated. */
  retreated: boolean;
  /** The defender with placement. */
  defenderWithPlacement: UnitWithPlacement;
  /** The legal retreat options. */
  legalRetreatOptions: UnitPlacement[];
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

const _resolveRangedAttackEventSchemaObject = z.object({
  defenderWithPlacement: unitWithPlacementSchema,
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  eventNumber: z.number(),
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  legalRetreatOptions: z.array(unitPlacementSchema),
  retreated: z.boolean(),
  reversed: z.boolean(),
  routed: z.boolean(),
});

type ResolveRangedAttackEventSchemaType = z.infer<
  typeof _resolveRangedAttackEventSchemaObject
>;

const _assertExactResolveRangedAttackEvent: AssertExact<
  ResolveRangedAttackEvent,
  ResolveRangedAttackEventSchemaType
> = true;

/** The schema for a resolve ranged attack event. */
export const resolveRangedAttackEventSchema: z.ZodObject<{
  defenderWithPlacement: typeof unitWithPlacementSchema;
  effectType: z.ZodLiteral<typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  legalRetreatOptions: z.ZodArray<typeof unitPlacementSchema>;
  retreated: z.ZodBoolean;
  reversed: z.ZodBoolean;
  routed: z.ZodBoolean;
}> = _resolveRangedAttackEventSchemaObject;
