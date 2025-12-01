import { z } from "zod";
import { playerSideSchema } from "../player/playerSide.js";
import { unitPresenceSchema } from "../unitPresence/unitPresence.js";
import { elevationSchema } from "./elevation.js";
import { terrainTypeSchema } from "./terrainTypes.js";
import { waterCoverSchema } from "./waterCover.js";
/**
 * The schema for a space of the game board.
 */
export const boardSpaceSchema = z.object({
    /**
     * The type of terrain in the space.
     */
    terrainType: terrainTypeSchema,
    /**
     * The elevation of the space.
     */
    elevation: elevationSchema,
    /**
     * The water cover of the space.
     */
    waterCover: waterCoverSchema,
    /**
     * The unit presence in the space.
     */
    unitPresence: unitPresenceSchema,
    /**
     * The commanders in the space.
     */
    commanders: z.set(playerSideSchema),
});
const _assertExactBoardSpace = true;
