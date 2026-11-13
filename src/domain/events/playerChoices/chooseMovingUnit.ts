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
 *
 * `getLegalMoveUnits` enumerates the legal options, and
 * `applyChooseMovingUnitEvent` applies the choice.
 */
export interface ChooseMovingUnitEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_MOVING_UNIT_CHOICE_TYPE;
  /** The player carrying out the order. */
  player: PlayerSide;
  /** The unit that moves next, and where it stands. */
  unit: UnitWithPlacement;
}

const _chooseMovingUnitEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_MOVING_UNIT_CHOICE_TYPE),
    /** The player carrying out the order. */
    player: playerSideSchema,
    /** The unit that moves next, and where it stands. */
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
  unit: typeof unitWithPlacementSchema;
}> = _chooseMovingUnitEventSchemaObject;
