import type { Coordinate, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { coordinateSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the move commander event. */
export const MOVE_COMMANDER_CHOICE_TYPE = 'moveCommander' as const;

export interface MoveCommanderEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_COMMANDER_CHOICE_TYPE;
  /** The coordinate the commander is moving from. */
  from: Coordinate;
  /** The coordinate the commander is moving to. */
  to: Coordinate;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The player who is moving the commander. */
  player: PlayerSide;
}

const _moveCommanderEventSchemaObject = z.object({
  choiceType: z.literal(MOVE_COMMANDER_CHOICE_TYPE),
  eventNumber: z.number(),
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  from: coordinateSchema,
  player: playerSideSchema,
  to: coordinateSchema,
});

type MoveCommanderEventSchemaType = z.infer<
  typeof _moveCommanderEventSchemaObject
>;

const _assertExactMoveCommanderEvent: AssertExact<
  MoveCommanderEvent,
  MoveCommanderEventSchemaType
> = true;

/** The schema for a move commander event. */
export const moveCommanderEventSchema: z.ZodObject<{
  choiceType: z.ZodLiteral<typeof MOVE_COMMANDER_CHOICE_TYPE>,
  eventNumber: z.ZodNumber,
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>,
  from: typeof coordinateSchema,
  player: typeof playerSideSchema,
  to: typeof coordinateSchema,
}> =
  _moveCommanderEventSchemaObject;
