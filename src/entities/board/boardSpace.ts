import type { AssertExact } from "../../assertExact.js";
import type { UnitPresence } from "../unit/unitPresence.js";
import type { Elevation } from "./elevation.js";
import type { TerrainType } from "./terrainTypes.js";
import type { WaterCover } from "./waterCover.js";

import { z } from "zod";
import { unitPresenceSchema } from "../unit/unitPresence.js";
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

// Helper type to check match of type against schema
type boardSpaceSchemaType = z.infer<typeof boardSpaceSchema>;

/**
 * A space of the game board.
 */
export interface BoardSpace {
  /**
   * The type of terrain in the space.
   */
  terrainType: TerrainType;
  /**
   * The elevation of the space.
   */
  elevation: Elevation;
  /**
   * The water cover of the space.
   */
  waterCover: WaterCover;
  /**
   * The unit presence in the space.
   */
  unitPresence: UnitPresence;
}

const _assertExactBoardSpace: AssertExact<BoardSpace, boardSpaceSchemaType> =
  true;
