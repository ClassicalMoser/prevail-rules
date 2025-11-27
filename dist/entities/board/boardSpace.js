import { z } from "zod";
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
});
const _assertExactBoardSpace = true;
