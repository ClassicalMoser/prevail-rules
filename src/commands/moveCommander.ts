import type { Board, BoardCoordinate, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { boardCoordinateSchema, playerSideSchema } from '@entities';
import { z } from 'zod';

/** The schema for a move commander command. */
export const moveCommanderCommandSchema = z.object({
  /** The player who is moving the commander. */
  player: playerSideSchema,
  /** The space the commander is currently in. */
  from: boardCoordinateSchema,
  /** The space the commander is moving to. */
  to: boardCoordinateSchema,
});

// Helper type to check match of type against schema.
type MoveCommanderCommandSchemaType = z.infer<
  typeof moveCommanderCommandSchema
>;

/** A command to move a commander from one space to another. */
export interface MoveCommanderCommand {
  /** The player who is moving the commander. */
  player: PlayerSide;
  /** The space the commander is currently in. */
  from: BoardCoordinate<Board>;
  /** The space the commander is moving to. */
  to: BoardCoordinate<Board>;
}

// Helper type to check match of type against schema.
const _assertExactMoveCommanderCommand: AssertExact<
  MoveCommanderCommand,
  MoveCommanderCommandSchemaType
> = true;
