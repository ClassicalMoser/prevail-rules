/**
 * One cell of the board: cover, difficulty, elevation, and who occupies it.
 *
 * Coordinates key spaces on `Board.board`; this type is the value at
 * each key. Ground cover ({@link GroundCover}), its difficulty, whether it
 * blocks sight, and corner heights ({@link Elevation}) are separate so
 * queries can reason about each independently. Occupancy is
 * {@link UnitPresence} (none / single / engaged) plus a list of commander
 * sides currently on the space.
 */

import type { PlayerSide } from '@entities/player';
import type { UnitPresence } from '@entities/unitPresence';
import type { AssertExact } from '@utils';
import type { Elevation } from './elevation';
import type { GroundCover } from './groundCover';

import { playerSideSchema } from '@entities/player';
import { unitPresenceSchema } from '@entities/unitPresence';
import { z } from 'zod';
import { elevationSchema } from './elevation';
import { groundCoverSchema } from './groundCover';

/**
 * A space of the game board.
 *
 * Field roles:
 * - `groundCover` — what covers the ground (open, wood, marsh, …)
 * - `elevation` — height at each of the four corners (-1 to +1)
 * - `terrainDifficulty` — the Flexibility a unit needs to cross it unimpeded
 * - `blocking` — whether it blocks line of sight
 * - `unitPresence` — empty, one unit, or two engaged units
 * - `commanders` — player sides whose commanders stand here (may be empty);
 *   a commander does not occupy the space (§2.2.2)
 */
export interface BoardSpace {
  /**
   * Ground cover for this space.
   * Elevation and difficulty are separate fields.
   */
  groundCover: GroundCover;
  /**
   * Corner elevations for this space (NW / NE / SW / SE).
   */
  elevation: Elevation;
  /**
   * Terrain difficulty defines the flexibility threshold for the space.
   */
  terrainDifficulty: number;
  /**
   * Blocking defines whether the space obstructs line of sight.
   */
  blocking: boolean;
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
     * Elevation and Difficulty are separate fields.
     */
    groundCover: groundCoverSchema,
    /**
     * Corner elevations for this space (NW / NE / SW / SE).
     */
    elevation: elevationSchema,
    /**
     * The minimum flexibility to pass unimpeded.
     */
    terrainDifficulty: z.int().min(0),
    /**
     * Whether the space obstructs line of sight.
     */
    blocking: z.boolean(),
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
 * Strict object: unknown keys fail. Every field is required; nothing is
 * filled in by default.
 */
export const boardSpaceSchema: z.ZodType<BoardSpace> = _boardSpaceSchemaObject;

// Verify manual type matches schema inference
const _assertExactBoardSpace: AssertExact<BoardSpace, boardSpaceSchemaType> =
  true;
