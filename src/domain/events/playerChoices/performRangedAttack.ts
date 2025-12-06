import type { Board, PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { z } from 'zod';
import { PLAYER_CHOICE_EVENT_TYPE } from '../eventType';
import { PERFORM_RANGED_ATTACK_CHOICE_TYPE } from './playerChoice';


export interface PerformRangedAttackEvent {
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
  PerformRangedAttackEvent,
  PerformRangedAttackEventSchemaType
> = true;

/** The schema for a perform ranged attack event. */
export const performRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  unit: typeof unitWithPlacementSchema;
  targetUnit: typeof unitWithPlacementSchema;
  supportingUnits: z.ZodSet<typeof unitWithPlacementSchema>;
}> = _performRangedAttackEventSchemaObject;
