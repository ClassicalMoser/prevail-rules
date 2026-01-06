import type { Board, PlayerSide, UnitInstance, UnitPlacement } from '@entities';
import type { AssertExact } from '@utils';
import {
  playerSideSchema,
  unitInstanceSchema,
  unitPlacementSchema,
} from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { MOVE_UNIT_CHOICE_TYPE } from './playerChoice';

/** An event to move a unit from one space to another. */
export interface MoveUnitEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_UNIT_CHOICE_TYPE;
  /** The player who is moving the unit. */
  player: PlayerSide;
  /** The unit to move. */
  unit: UnitInstance;
  /** The space the unit is currently in. */
  from: UnitPlacement<Board>;
  /** The space the unit is moving to. */
  to: UnitPlacement<Board>;
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
}

const _moveUnitEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(MOVE_UNIT_CHOICE_TYPE),
  /** The player who is moving the unit. */
  player: playerSideSchema,
  /** The unit to move. */
  unit: unitInstanceSchema,
  /** The space the unit is currently in. */
  from: unitPlacementSchema,
  /** The space the unit is moving to. */
  to: unitPlacementSchema,
  /** Whether to move the commander with the unit. */
  moveCommander: z.boolean(),
});

type MoveUnitEventSchemaType = z.infer<typeof _moveUnitEventSchemaObject>;

// Verify manual type matches schema inference
const _assertExactMoveUnitEvent: AssertExact<
  MoveUnitEvent,
  MoveUnitEventSchemaType
> = true;

/** The schema for a move unit event. */
export const moveUnitEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof MOVE_UNIT_CHOICE_TYPE>;
  player: z.ZodType<PlayerSide>;
  unit: z.ZodType<UnitInstance>;
  from: z.ZodType<UnitPlacement<Board>>;
  to: z.ZodType<UnitPlacement<Board>>;
  moveCommander: z.ZodType<boolean>;
}> = _moveUnitEventSchemaObject;
