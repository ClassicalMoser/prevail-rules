import { unitInstanceSchema } from "src/entities/unit/unitInstance.js";
import { unitPlacementSchema } from "src/entities/unitLocation/unitPlacement.js";
import { z } from "zod";
import { playerSideSchema } from "../entities/player/playerSide.js";
/** The schema for a move unit command. */
export const moveUnitCommandSchema = z.object({
    /** The player who is moving the unit. */
    player: playerSideSchema,
    /** The unit to move. */
    unit: unitInstanceSchema,
    /** The space the unit is currently in. */
    from: unitPlacementSchema,
    /** The space the unit is moving to. */
    to: unitPlacementSchema,
});
// Helper type to check match of type against schema.
const _assertExactMoveUnitCommand = true;
