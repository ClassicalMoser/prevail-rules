import { boardCoordinateSchema } from "src/entities/board/boardCoordinates.js";
import { playerSideSchema } from "src/entities/player/playerSide.js";
import { z } from "zod";
/** The schema for a move commander command. */
export const moveCommanderCommandSchema = z.object({
    player: playerSideSchema,
    from: boardCoordinateSchema,
    to: boardCoordinateSchema,
});
// Helper type to check match of type against schema.
const _assertExactMoveCommanderCommand = true;
