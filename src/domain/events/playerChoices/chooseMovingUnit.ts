import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { playerSideSchema, unitWithPlacementSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose moving unit event. */
export const CHOOSE_MOVING_UNIT_CHOICE_TYPE = 'chooseMovingUnit' as const;

/**
 * The first step of carrying out a Move order for one unit (§4.3.10): the
 * player names which of the ordered units moves next. Its owner may then
 * commit a card for the move (`commitToMovement`), and only after that
 * writes the move itself (`moveUnit`).
 */
export interface ChooseMovingUnitEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_MOVING_UNIT_CHOICE_TYPE;
  /** The player carrying out the order. */
  player: PlayerSide;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The unit that moves next, and where it stands. */
  unit: UnitWithPlacement;
}

const _chooseMovingUnitEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(CHOOSE_MOVING_UNIT_CHOICE_TYPE),
    player: playerSideSchema,
    eventNumber: z.number(),
    unit: unitWithPlacementSchema,
  })
  .strict();

type ChooseMovingUnitEventSchemaType = z.infer<
  typeof _chooseMovingUnitEventSchemaObject
>;

const _assertExactChooseMovingUnitEvent: AssertExact<
  ChooseMovingUnitEvent,
  ChooseMovingUnitEventSchemaType
> = true;

/** The schema for a choose moving unit event. */
export const chooseMovingUnitEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_MOVING_UNIT_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
  unit: typeof unitWithPlacementSchema;
}> = _chooseMovingUnitEventSchemaObject;
