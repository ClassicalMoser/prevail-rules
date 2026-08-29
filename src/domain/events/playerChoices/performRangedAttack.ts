import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the perform ranged attack event. */
export const PERFORM_RANGED_ATTACK_CHOICE_TYPE = 'performRangedAttack' as const;

export interface PerformRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE;
  /** The unit that is performing the ranged attack. */
  unit: UnitWithPlacement;
  /** The target unit that is being attacked. */
  targetUnit: UnitWithPlacement;
  /** Any supporting units. */
  supportingUnits: UnitWithPlacement[];
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is performing the ranged attack. */
  player: PlayerSide;
}

const _performRangedAttackEventSchemaObject = z
  .object({
    choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
    eventNumber: z.number(),
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    player: playerSideSchema,
    supportingUnits: z.array(unitWithPlacementSchema),
    targetUnit: unitWithPlacementSchema,
    unit: unitWithPlacementSchema,
  })
  .strict();

type PerformRangedAttackEventSchemaType = z.infer<
  typeof _performRangedAttackEventSchemaObject
>;

const _assertExactPerformRangedAttackEvent: AssertExact<
  PerformRangedAttackEvent,
  PerformRangedAttackEventSchemaType
> = true;

/** The schema for a perform ranged attack event. */
export const performRangedAttackEventSchema: z.ZodObject<{
  choiceType: z.ZodLiteral<typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE>;
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  player: typeof playerSideSchema;
  supportingUnits: z.ZodArray<typeof unitWithPlacementSchema>;
  targetUnit: typeof unitWithPlacementSchema;
  unit: typeof unitWithPlacementSchema;
}> = _performRangedAttackEventSchemaObject;
