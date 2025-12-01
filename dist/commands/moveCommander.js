import { boardCoordinateSchema } from "src/entities/board/boardCoordinates.js";
import { playerSideSchema } from "src/entities/player/playerSide.js";
import { z } from "zod";
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
const _assertExactMoveCommanderCommand = true;
