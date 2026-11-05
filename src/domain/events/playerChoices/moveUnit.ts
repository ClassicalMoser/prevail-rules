import type { PlayerSide, UnitPlacement, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import {
  playerSideSchema,
  unitPlacementSchema,
  unitWithPlacementSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the move unit event. */
export const MOVE_UNIT_CHOICE_TYPE = 'moveUnit' as const;

export interface MoveUnitEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_UNIT_CHOICE_TYPE;
  /** The player who is moving the unit. */
  player: PlayerSide;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The unit to move. */
  unit: UnitWithPlacement;
  /** The space the unit is moving to. */
  to: UnitPlacement;
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
}

const _moveUnitEventSchemaObject = z
  .object({
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
    player: playerSideSchema,
    eventNumber: z.number(),
    moveCommander: z.boolean(),
    to: unitPlacementSchema,
    unit: unitWithPlacementSchema,
  })
  .strict();

type MoveUnitEventSchemaType = z.infer<typeof _moveUnitEventSchemaObject>;

const _assertExactMoveUnitEvent: AssertExact<
  MoveUnitEvent,
  MoveUnitEventSchemaType
> = true;

/** The schema for a move unit event. */
export const moveUnitEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  eventNumber: z.ZodNumber;
  moveCommander: z.ZodBoolean;
  to: typeof unitPlacementSchema;
  unit: typeof unitWithPlacementSchema;
}> = _moveUnitEventSchemaObject;
