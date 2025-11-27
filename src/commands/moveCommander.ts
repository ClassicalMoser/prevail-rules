import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import type { AssertExact } from "src/utils/assertExact.js";
import { boardCoordinateSchema } from "src/entities/board/boardCoordinates.js";
import { playerSideSchema } from "src/entities/player/playerSide.js";
import { z } from "zod";

export const moveCommanderCommandSchema = z.object({
  player: playerSideSchema,
  from: boardCoordinateSchema,
  to: boardCoordinateSchema,
});

type MoveCommanderCommandSchemaType = z.infer<
  typeof moveCommanderCommandSchema
>;

export interface MoveCommanderCommand {
  player: PlayerSide;
  from: BoardCoordinate<Board>;
  to: BoardCoordinate<Board>;
}

// Helper type to check match of type against schema.
const _assertExactMoveCommanderCommand: AssertExact<
  MoveCommanderCommand,
  MoveCommanderCommandSchemaType
> = true;
