import type { Board, BoardCoordinate, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { boardCoordinateSchema, playerSideSchema } from '@entities';
import { z } from 'zod';

/** A command to move a commander from one space to another. */
export interface MoveCommanderCommand {
  /** The player who is moving the commander. */
  player: PlayerSide;
  /** The space the commander is currently in. */
  from: BoardCoordinate<Board>;
  /** The space the commander is moving to. */
  to: BoardCoordinate<Board>;
}

const _moveCommanderCommandSchemaObject = z.object({
  /** The player who is moving the commander. */
  player: playerSideSchema,
  /** The space the commander is currently in. */
  from: boardCoordinateSchema,
  /** The space the commander is moving to. */
  to: boardCoordinateSchema,
});

type MoveCommanderCommandSchemaType = z.infer<
  typeof _moveCommanderCommandSchemaObject
>;

/** The schema for a move commander command. */
export const moveCommanderCommandSchema: z.ZodType<MoveCommanderCommand> =
  _moveCommanderCommandSchemaObject;

// Verify manual type matches schema inference
const _assertExactMoveCommanderCommand: AssertExact<
  MoveCommanderCommand,
  MoveCommanderCommandSchemaType
> = true;
