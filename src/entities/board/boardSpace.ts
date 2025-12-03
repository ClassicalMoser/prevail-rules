import type { Elevation } from "@entities/board/elevation.js";
import type { TerrainType } from "@entities/board/terrainTypes.js";
import type { WaterCover } from "@entities/board/waterCover.js";
import type { PlayerSide } from "@entities/player/playerSide.js";
import type { UnitPresence } from "@entities/unitPresence/unitPresence.js";

import type { AssertExact } from "@utils/assertExact.js";
import { elevationSchema } from "@entities/board/elevation.js";
import { terrainTypeSchema } from "@entities/board/terrainTypes.js";
import { waterCoverSchema } from "@entities/board/waterCover.js";
import { playerSideSchema } from "@entities/player/playerSide.js";
import { unitPresenceSchema } from "@entities/unitPresence/unitPresence.js";
import { z } from "zod";

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
  /**
   * The commanders in the space.
   */
  commanders: Set<PlayerSide>;
}

const _assertExactBoardSpace: AssertExact<BoardSpace, boardSpaceSchemaType> =
  true;
