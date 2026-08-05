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
  /** The unit to move. */
  unit: UnitWithPlacement;
  /** The space the unit is moving to. */
  to: UnitPlacement;
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is moving the unit. */
  player: PlayerSide;
}

const _moveUnitEventSchemaObject = z.object({
  choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
  eventNumber: z.number(),
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  moveCommander: z.boolean(),
  player: playerSideSchema,
  to: unitPlacementSchema,
  unit: unitWithPlacementSchema,
});

type MoveUnitEventSchemaType = z.infer<typeof _moveUnitEventSchemaObject>;

const _assertExactMoveUnitEvent: AssertExact<
  MoveUnitEvent,
  MoveUnitEventSchemaType
> = true;

/** The schema for a move unit event. */
export const moveUnitEventSchema: z.ZodObject<{
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>,
  eventNumber: z.ZodNumber,
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>,
  moveCommander: z.ZodBoolean,
  player: typeof playerSideSchema,
  to: typeof unitPlacementSchema,
  unit: typeof unitWithPlacementSchema,
}> =
  _moveUnitEventSchemaObject;
