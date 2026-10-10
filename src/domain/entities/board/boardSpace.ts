/**
 * One cell of the board: terrain, elevation, water, and who occupies it.
 *
 * Coordinates key spaces on {@link Board.board}; this type is the value at
 * each key. Ground cover ({@link TerrainType}), corner heights
 * ({@link Elevation}), and edge water ({@link WaterCover}) are separate so
 * queries can reason about each independently. Occupancy is
 * {@link UnitPresence} (none / single / engaged) plus a list of commander
 * sides currently on the space.
 */

import type { PlayerSide } from '@entities/player';
import type { UnitPresence } from '@entities/unitPresence';
import type { AssertExact } from '@utils';
import type { Elevation } from './elevation';
import type { TerrainType } from './terrainTypes';
import type { WaterCover } from './waterCover';

import { playerSideSchema } from '@entities/player';
import { unitPresenceSchema } from '@entities/unitPresence';
import { z } from 'zod';
import { elevationSchema } from './elevation';
import { terrainTypeSchema } from './terrainTypes';
import { waterCoverSchema } from './waterCover';

/**
 * A space of the game board.
 *
 * Field roles:
 * - `terrainType` — ground cover (plain, forest, …); not elevation or water
 * - `elevation` — height at each of the four corners (0–5)
 * - `waterCover` — which of the eight edges are water
 * - `unitPresence` — empty, one unit, or two engaged units
 * - `commanders` — player sides whose commanders occupy this space (may be empty)
 */
export interface BoardSpace {
  /**
   * Ground cover for this space.
   * Elevation and water are separate fields.
   */
  terrainType: TerrainType;
  /**
   * Corner elevations for this space (NW / NE / SW / SE).
   */
  elevation: Elevation;
  /**
   * Which edges of this space are covered by water.
   */
  waterCover: WaterCover;
  /**
   * Units in this space (none, single, or engaged pair).
   */
  unitPresence: UnitPresence;
  /**
   * Commanders present on this space, by player side.
   * Distinct from unit presence — commanders stack on spaces independently.
   */
  commanders: PlayerSide[];
}

const _boardSpaceSchemaObject = z
  .object({
    /**
     * Ground cover for this space.
     * Elevation and water are separate fields.
     */
    terrainType: terrainTypeSchema,
    /**
     * Corner elevations for this space (NW / NE / SW / SE).
     */
    elevation: elevationSchema,
    /**
     * Which edges of this space are covered by water.
     */
    waterCover: waterCoverSchema,
    /**
     * Units in this space (none, single, or engaged pair).
     */
    unitPresence: unitPresenceSchema,
    /**
     * Commanders present on this space, by player side.
     */
    commanders: z.array(playerSideSchema),
  })
  .strict();

type boardSpaceSchemaType = z.infer<typeof _boardSpaceSchemaObject>;

/**
 * Zod schema for a board space.
 * Strict object: unknown keys fail. Nested schemas supply defaults where the
 * rules allow (e.g. elevation 0, water false, terrain plain).
 */
export const boardSpaceSchema: z.ZodType<BoardSpace> = _boardSpaceSchemaObject;

// Verify manual type matches schema inference
const _assertExactBoardSpace: AssertExact<BoardSpace, boardSpaceSchemaType> =
  true;
