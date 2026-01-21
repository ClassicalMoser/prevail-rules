import type { Board, BoardCoordinate, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { boardCoordinateSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the move commander event. */
export const MOVE_COMMANDER_CHOICE_TYPE = 'moveCommander' as const;

/** An event to move a commander from one space to another. */
export interface MoveCommanderEvent<
  TBoard extends Board,
  _TChoiceType extends 'moveCommander' = 'moveCommander',
> {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof MOVE_COMMANDER_CHOICE_TYPE;
  /** The player who is moving the commander. */
  player: PlayerSide;
  /** The space the commander is currently in. */
  from: BoardCoordinate<TBoard>;
  /** The space the commander is moving to. */
  to: BoardCoordinate<TBoard>;
}

const _moveCommanderEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(MOVE_COMMANDER_CHOICE_TYPE),
  /** The player who is moving the commander. */
  player: playerSideSchema,
  /** The space the commander is currently in. */
  from: boardCoordinateSchema,
  /** The space the commander is moving to. */
  to: boardCoordinateSchema,
});

type MoveCommanderEventSchemaType = z.infer<
  typeof _moveCommanderEventSchemaObject
>;

/** The schema for a move commander event. */
export const moveCommanderEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'moveCommander'>;
  player: z.ZodType<PlayerSide>;
  from: z.ZodType<BoardCoordinate<Board>>;
  to: z.ZodType<BoardCoordinate<Board>>;
}> = _moveCommanderEventSchemaObject;

// Verify manual type matches schema inference
const _assertExactMoveCommanderEvent: AssertExact<
  MoveCommanderEvent<Board>,
  MoveCommanderEventSchemaType
> = true;
