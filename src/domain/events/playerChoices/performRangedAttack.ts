import type { Board, PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the perform ranged attack event. */
export const PERFORM_RANGED_ATTACK_CHOICE_TYPE = 'performRangedAttack' as const;

export interface PerformRangedAttackEvent<
  _TBoard extends Board,
  _TChoiceType extends 'performRangedAttack' = 'performRangedAttack',
> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE;
  /** The player who is performing the ranged attack. */
  player: PlayerSide;
  /** The unit that is performing the ranged attack. */
  unit: UnitWithPlacement<Board>;
  /** The target unit that is being attacked. */
  targetUnit: UnitWithPlacement<Board>;
  /** Any supporting units. */
  supportingUnits: Set<UnitWithPlacement<Board>>;
}

const _performRangedAttackEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
  /** The player who is performing the ranged attack. */
  player: playerSideSchema,
  /** The unit that is performing the ranged attack. */
  unit: unitWithPlacementSchema,
  /** The target unit that is being attacked. */
  targetUnit: unitWithPlacementSchema,
  /** Any supporting units. */
  supportingUnits: z.set(unitWithPlacementSchema),
});

type PerformRangedAttackEventSchemaType = z.infer<
  typeof _performRangedAttackEventSchemaObject
>;

const _assertExactPerformRangedAttackEvent: AssertExact<
  PerformRangedAttackEvent<Board>,
  PerformRangedAttackEventSchemaType
> = true;

/** The schema for a perform ranged attack event. */
export const performRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'performRangedAttack'>;
  player: typeof playerSideSchema;
  unit: typeof unitWithPlacementSchema;
  targetUnit: typeof unitWithPlacementSchema;
  supportingUnits: z.ZodSet<typeof unitWithPlacementSchema>;
}> = _performRangedAttackEventSchemaObject;
