import { boardCoordinateSchema } from "src/entities/board/boardCoordinates.js";
import { playerSideSchema } from "src/entities/player/playerSide.js";
import { unitInstanceSchema } from "src/entities/unit/unitInstance.js";
import { z } from "zod";
/** The schema for a setup unit command. */
export const setupUnitCommandSchema = z.object({
    /** The player who is setting up the unit. */
    player: playerSideSchema,
    /** The unit to setup. */
    unit: unitInstanceSchema,
    /** The space to setup the unit on. */
    space: boardCoordinateSchema,
});
// Helper type to check match of type against schema.
const _assertExactSetupUnitCommand = true;
