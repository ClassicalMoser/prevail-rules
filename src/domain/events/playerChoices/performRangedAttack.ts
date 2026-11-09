import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the perform ranged attack event. */
export const PERFORM_RANGED_ATTACK_CHOICE_TYPE = 'performRangedAttack' as const;

/**
 * The shot itself, under a Shoot order (§4.3.11 steps 3–4): the target, and
 * any supporters who spend their own shots to add +1 each. The firing unit
 * was named by `chooseFiringUnit` and its card committed by
 * `commitToRangedAttack`, so this event carries only what is aimed at.
 */
export interface PerformRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE;
  /** The shooting player. */
  player: PlayerSide;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The enemy unit being shot at, and where it stands. */
  targetUnit: UnitWithPlacement;
  /** Other units of the same order spending their shots on this one (§7.3.4). */
  supportingUnits: UnitWithPlacement[];
}

const _performRangedAttackEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(PERFORM_RANGED_ATTACK_CHOICE_TYPE),
    player: playerSideSchema,
    eventNumber: z.number(),
    supportingUnits: z.array(unitWithPlacementSchema),
    targetUnit: unitWithPlacementSchema,
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
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof PERFORM_RANGED_ATTACK_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
  supportingUnits: z.ZodArray<typeof unitWithPlacementSchema>;
  targetUnit: typeof unitWithPlacementSchema;
}> = _performRangedAttackEventSchemaObject;
